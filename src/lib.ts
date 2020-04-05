import {
  EventDef,
  StateDef,
  StateConfig,
} from './types';

export function rebuildActiveStates<ContextType>(
  currentState: StateConfig<ContextType>,
  previousActiveStates: StateConfig<ContextType>[],
  statePaths: StateConfig<ContextType>[],
) {
  if (previousActiveStates[previousActiveStates.length-1] === currentState) {
    return previousActiveStates;
  }
  const comps = currentState.path.absolute.split('/').filter(c => c.length);
  const acc: StateConfig<ContextType>[] = [];
  for (let i = 1; i <= comps.length; i++) {
    const path = `/${comps.slice(0, i).join('/')}`;
    const parentResult = previousActiveStates.find(sp => sp.path.absolute === path);
    const result = parentResult || statePaths.find(sp => sp.path.absolute === path);
    if (result) acc.push(result);
    else throw new Error(`No state found for path "${path}"`);
  }
  return acc;
}

export function findInitialChildState<ContextType>(
  ctx: ContextType,
  statePaths: StateConfig<ContextType>[],
  parent: StateConfig<ContextType>,
) :StateConfig<ContextType>|undefined {
  if (hasChildStates(parent.state)) {
    if (parent.state.initial) {
      let initial = initialStateName<ContextType>(parent.state.initial, ctx);
      const basePath = parent.path.absolute.endsWith('/')
        ? parent.path.absolute
        : `${parent.path.absolute}/`;
      const absolutePath = resolvePath(basePath, initial);
      const child = statePaths.find(sp => sp.path.absolute === absolutePath);
      if (child) {
        if (hasChildStates(child.state)) {
          return findInitialChildState(ctx, statePaths, child);
        } else {
          return child;
        }
      } else {
        throw new Error(`State "${parent.path.absolute}" initial state "${initial}" doesn't match any of the definitions`);
      }
    } else {
      throw new Error(`State "${parent.path.absolute}" has child-states, but doesn't define initial`);
    }
  }
}

function hasChildStates<ContextType>(state: StateDef<ContextType>) :boolean {
  return !!(state.states && Object.values(state.states).length);
}

export function updateContext<ContextType, EventType>(
  ctx: ContextType,
  def: EventDef<ContextType>,
  event?: EventType,
) {
  const update = {...ctx};
  let didUpdate = false;
  for (const propName in def.update) {
    const anyFn = def.update[propName];
    if (typeof anyFn === 'function') {
      const fn = anyFn as (ctx: ContextType, ev?: EventType) => any;
      update[propName] = fn(update, event);
      didUpdate = true;
    }
  }
  if (didUpdate) return update;
}

export function initialStateName<ContextType>(
  initial: string|((ctx: ContextType) => string),
  ctx: ContextType,
) {
  return (typeof initial === 'string') ? initial : initial(ctx);
}

export function resolvePath(base: string, relativeComp: string) {
  if (!base.startsWith('/')) throw new Error('Base component of path must start with /');
  const host = 'http://con5.app';
  const url = (new URL(relativeComp, `${host}${base}`)).href;
  return url.slice(host.length);
}
