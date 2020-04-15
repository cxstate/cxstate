import {
  EventDef,
  StateDef,
  StateConfig,
} from './types';

export function rebuildActiveStates<TContext>(
  currentState: StateConfig<TContext>,
  previousActiveStates: StateConfig<TContext>[],
  statePaths: StateConfig<TContext>[],
) {
  if (previousActiveStates[previousActiveStates.length-1] === currentState) {
    return previousActiveStates;
  }
  const comps = currentState.path.absolute.split('/').filter(c => c.length);
  const acc: StateConfig<TContext>[] = [];
  for (let i = 1; i <= comps.length; i++) {
    const path = `/${comps.slice(0, i).join('/')}`;
    const parentResult = previousActiveStates.find(sp => sp.path.absolute === path);
    const result = parentResult || statePaths.find(sp => sp.path.absolute === path);
    if (result) acc.push(result);
    else throw new Error(`No state found for path "${path}"`);
  }
  return acc;
}

export function findInitialChildState<TContext>(
  ctx: TContext,
  statePaths: StateConfig<TContext>[],
  parent: StateConfig<TContext>,
) :StateConfig<TContext>|undefined {
  if (hasChildStates(parent.state)) {
    if (parent.state.initial) {
      let initial = initialStateName<TContext>(parent.state.initial, ctx);
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

function hasChildStates<TContext>(state: StateDef<TContext>) :boolean {
  return !!(state.states && Object.values(state.states).length);
}

export function updateContext<TContext, TPayload>(
  ctx: TContext,
  def: EventDef<TContext>,
  payload?: TPayload,
) {
  const update = {...ctx};
  let didUpdate = false;
  for (const propName in def.update) {
    const anyFn = def.update[propName];
    if (typeof anyFn === 'function') {
      const fn = anyFn as (ctx: TContext, pl?: TPayload) => any;
      const changedValue = fn(update, payload);
      if (changedValue !== update[propName]) {
        update[propName] = changedValue;
        didUpdate = true;
      }
    }
  }
  if (didUpdate) return update;
}

export function initialStateName<TContext>(
  initial: string|((ctx: TContext) => string),
  ctx: TContext,
) {
  return (typeof initial === 'string') ? initial : initial(ctx);
}

export function resolvePath(base: string, relativeComp: string) {
  if (!base.startsWith('/')) throw new Error('Base component of path must start with /');
  const host = 'http://con5.app';
  const url = (new URL(relativeComp, `${host}${base}`)).href;
  return url.slice(host.length);
}
