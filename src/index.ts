import {
  EventDef,
  EventErrorType,
  StateDef,
  MachineDef,
  Service,
  StateConfig,
  OnTransitionFn,
} from './types';

import {
  rebuildActiveStates,
  findInitialChildState,
  updateContext,
  initialStateName,
  resolvePath,
} from './lib';

/**
 * Internprets a machine-definition. Returns a ready to use machine-service.
 */
export function interpret<TContext>(
  machineDef: MachineDef<TContext>,
) :Service<TContext> {
  const stateConfigs: StateConfig<TContext>[] = [];

  const buildStateConfigs = (
    basePath: string,
    name: string,
    state: StateDef<TContext>,
  ) => {
    const absolute = resolvePath(basePath, name);
    stateConfigs.push({state, path: {name, absolute}});

    if (state.states && Object.values(state.states).length) {
      // Check minimum state validity
      if (!state.initial) throw new Error(`State "${absolute}" has child-states, but doesn't define initial`);
      // Check minimum validity of events
      if (state.on) Object.entries(state.on).forEach(([eventName, eventDef]) => {
        const checkEvent = (ed: string|EventDef<TContext>) => {
          if (typeof ed !== 'string') {
            if (ed.replace && ed.update) throw new Error(`State"${absolute}" / Event "${eventName}": <replace> and <update> are mutually exclusive`);
            if (ed.target && ed.next) throw new Error(`State"${absolute}" / Event "${eventName}": <target> and <next> are mutually exclusive`);
          }
        };
        if (eventDef instanceof Array) eventDef.forEach(checkEvent);
        else checkEvent(eventDef);
      });
      const nextBasePath = absolute.endsWith('/') ? absolute : `${absolute}/`;
      for (const [stateName, stateDef] of Object.entries(state.states)) {
        buildStateConfigs(nextBasePath, stateName, stateDef);
      }
    }
  };

  for (const [stateName, stateDef] of Object.entries(machineDef.states)) {
    buildStateConfigs('/', stateName, stateDef);
  }

  let initial = initialStateName<TContext>(machineDef.initial, machineDef.context);
  const initialAbsPath = initial.startsWith('/') ? initial : `/${initial}`;
  let initialState = stateConfigs.find(sp => sp.path.absolute === initialAbsPath);
  if (initialState) {
    const initialChild = findInitialChildState(machineDef.context, stateConfigs, initialState);
    if (initialChild) {
      initialState = initialChild;
    }
    return makeService(stateConfigs, machineDef.context, initialState);
  } else {
    throw new Error(`Initial state "${initial}" doesn't match any of the definitions`);
  }
}

function makeService<TContext>(
  stateConfigs: StateConfig<TContext>[],
  initialContext: TContext,
  initialState: StateConfig<TContext>,
) :Service<TContext> {
  let activeStates: StateConfig<TContext>[] =
    rebuildActiveStates<TContext>(initialState, [], stateConfigs);
  let currentContext: TContext = initialContext;
  const listeners: OnTransitionFn<TContext>[] = [];
  let matcherMemoization: {[key:string]: {result: boolean}} = {};
  const eventPayloadPromises = new Map<string, Promise<any>>();
  let isDirty: boolean = true;

  const currentState = () => activeStates[activeStates.length - 1];

  const findEventHandlerAndStateConfig = (eventName: string)
  :[
    string|EventDef<TContext>|EventDef<TContext>[]|null,
    StateConfig<TContext>|null,
  ] => {
    for(let i = activeStates.length; i--;) {
      const config = activeStates[i];
      if (config.state.on) {
        const handler = config.state.on[eventName];
        if (handler) return [handler, config];
      }
    }
    return [null, null];
  };

  const informListeners = () => {
    for (const callback of listeners) {
      callback(currentContext, currentState().path.absolute);
    }
    isDirty = false;
  };

  // TRANSITION HANDLING

  const onTransition = (callback: OnTransitionFn<TContext>) => {
    listeners.push(callback);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx > -1) listeners.splice(idx, 1);
    };
  };

  // from: state path in which the event handler was found
  const transitionToTarget = <TPayload>(
    target: string,
    from: StateConfig<TContext>,
    srcPayload: TPayload,
  ) => {
    if (target) {
      const fsp = from.path;
      const targetPath = resolvePath(`${fsp.absolute}/`, target);
      const targetConfig = stateConfigs.find(sc => sc.path.absolute === targetPath);
      if (targetConfig) {
        transitionToState<TPayload>(targetConfig, srcPayload);
      } else {
        throw new Error(`No state defined for path "${targetPath}"`);
      }
    } else if (isDirty) {
      informListeners();
    }
  };

  // ACTIVE STATE HANDLING

  const transitionToState = <TPayload>(
    parent: StateConfig<TContext>,
    srcPayload: TPayload,
  ) => {
    const child = findInitialChildState(currentContext, stateConfigs, parent);
    const transitionTargetState = child ? child : parent;
    const rebuiltActiveStates =
      rebuildActiveStates<TContext>(transitionTargetState, activeStates, stateConfigs);
    if (rebuiltActiveStates !== activeStates) {
      activeStates = rebuiltActiveStates;
      matcherMemoization = {};
      isDirty = true;
      processCurrentStateEntryEvent<TPayload>(srcPayload);
    } /* TODO: temporary state. Else case is important for it. */
    if (isDirty) informListeners();
  };

  // EVENT PROCESSING

  const processCurrentStateEntryEvent = <TPayload=any>(srcPayload: TPayload) => {
    const cs = currentState();
    if (cs.state.entry) processAnyEventHandler<TPayload>(cs.state.entry, cs, srcPayload);
  };

  const processAnyEventHandler = <TPayload=AnalyserNode>(
    anyHandler: string|EventDef<TContext>|EventDef<TContext>[],
    from: StateConfig<TContext>,
    payload: TPayload,
  ) => {
    if (typeof anyHandler === 'string') {
      transitionToTarget<TPayload>(anyHandler, from, payload);
    } else if (anyHandler instanceof Array) {
      processEvents<TPayload>(anyHandler, from, payload);
    } else {
      processEvents<TPayload>([anyHandler], from, payload);
    }
  };

  const processEvents = <TPayload>(
    defs: EventDef<TContext, TPayload>[],
    from: StateConfig<TContext>,
    payload: TPayload,
  ) => {
    const mutate = (def: EventDef<TContext>) => {
      if (def.update) {
        const update = updateContext(currentContext, def, payload);
        if (update) {
          currentContext = update;
          isDirty = true;
        }
      } else if (def.replace) {
        const replacement = def.replace(currentContext, payload);
        if (replacement !== currentContext) {
          currentContext = replacement;
          isDirty = true;
        }
      }
    };
    const tap = (def: EventDef<TContext>) => {
      if (def.tap) def.tap(currentContext, payload);
    };
    const dispatch = (def: EventDef<TContext>) => {
      if (typeof def.next === 'string') send(def.next, payload);
      else if (def.next) send(...def.next(currentContext, payload));
      else if (isDirty) informListeners();
    };
    const transitionOrDispatch = (def: EventDef<TContext>) => {
      if (def.target && !def.next) transitionToTarget(def.target, from, payload);
      else if (!def.target && def.next) dispatch(def);
      else if (isDirty) informListeners();
    };
    for (const def of defs) {
      if (def.cond && def.cond(currentContext, payload)) {
        mutate(def);
        tap(def);
        transitionOrDispatch(def);
        break;
      } else if (!def.cond) {
        mutate(def);
        tap(def);
        transitionOrDispatch(def);
      } else if (isDirty) {
        informListeners();
      }
    }
  };

  const send = <TPayload=any>(
    name: string,
    payload: TPayload|Promise<TPayload>,
  ) => {
    const continueWithPayload = (
      eventName: string,
      eventPayload: TPayload|EventErrorType,
    ) => {
      const [anyHandler, config] = findEventHandlerAndStateConfig(eventName);
      if (anyHandler && config) {
        if (eventPayload && ('error' in eventPayload)) {
          processAnyEventHandler<EventErrorType>(anyHandler, config, eventPayload);
        } else {
          processAnyEventHandler<TPayload>(anyHandler, config, eventPayload);
        }
      }
    };

    if (payload instanceof Promise) {
      eventPayloadPromises.set(name, payload);
      if (isDirty) {
        // In case the event originated in a next, we should transitions before waiting for the promise to resolve
        informListeners();
      }
      (async () => {
        try {
          const success = await payload;
          if (eventPayloadPromises.get(name) === payload) {
            eventPayloadPromises.delete(name);
            continueWithPayload(name, success);
          }
        } catch (error) {
          eventPayloadPromises.delete(name);
          continueWithPayload(name, {error});
        }
      })();
    } else {
      continueWithPayload(name, payload);
    }
  };

  processCurrentStateEntryEvent<{}>({});

  // PATH MATCHING

  const matches = (positivMatchValue: boolean, paths: string[]) => {
    const memoKey = JSON.stringify([positivMatchValue ? 1 : 0, ...paths]);
    const memoValue = matcherMemoization[memoKey];
    if (memoValue) return memoValue.result;

    const cs = currentState();
    for (const toMatch of paths) {
      if (toMatch.startsWith('/')) {
        const toMatchComps = toMatch.split('/');
        const toMatchCompsLen = toMatchComps.length - 1; // LEADING "/" CAUSES 1 COMP OVERFLOW
        if (toMatchCompsLen === activeStates.length) {
          if (toMatch === cs.path.absolute) {
            matcherMemoization[memoKey] = {result: positivMatchValue};
            return positivMatchValue;
          }
        } else if (toMatchCompsLen < activeStates.length) {
          let foundMismatch = false;
          for (let i = 1; i < toMatchComps.length; i++) { // LEADING "/" CAUSES 1 COMP OVERFLOW
            if (toMatchComps[i] !== activeStates[i-1].path.name) { // LEADING "/" CAUSES 1 COMP OVERFLOW
              foundMismatch = true;
              break;
            }
          }
          if (!foundMismatch) {
            matcherMemoization[memoKey] = {result: positivMatchValue};
            return positivMatchValue;
          }
        }
      } else {
        const absToMatch = resolvePath(cs.path.absolute, toMatch);
        if (absToMatch === cs.path.absolute) {
          matcherMemoization[memoKey] = {result: positivMatchValue};
          return positivMatchValue;
        }
      }
    }

    matcherMemoization[memoKey] = {result: !positivMatchValue};
    return !positivMatchValue;
  };

  return {
    context: () => currentContext as Readonly<TContext>,
    path: () => currentState().path.absolute,
    send,
    matchesOne: (...paths: string[]) => matches(true, paths),
    matchesNone: (...paths: string[]) => matches(false, paths),
    onTransition,
  };
}
