import {
  EventDef,
  StateDef,
  MachineDef,
  Service,
  ParallelService,
  OnParallelTransitionFn,
} from './types';

// Machine definition typing helper functions

export const Event = <TContext, TPayload=any, TNextPayload=any>(def: EventDef<TContext, TPayload, TNextPayload>) => def;
export const Next = <TContext, TPayload, TNextPayload>(fn: (ctx: TContext, inputPayload: TPayload) => [string, TNextPayload]) => fn;
export const State = <TContext>(def: StateDef<TContext>) => def;
export const Machine = <TContext>(def: MachineDef<TContext>) => def;

export const DeferredNextEvent = <TContext=any, TPayload=any, TNextPayload=void>(
  nextEventName: string,
  deferredFn: (ctx: TContext, payload: TPayload) => Promise<TNextPayload>,
) => Event<TContext, TPayload>({
  next: Next<TContext, TPayload, Promise<TNextPayload>>(
    (ctx: TContext, payload: TPayload) => [
      nextEventName,
      deferredFn(ctx, payload),
    ],
  ),
});

// Parallel service constructor

export const parallelize = <TContext>(
  ...services: Service<Partial<TContext>>[]
) :ParallelService<TContext> => {
  const context = () :Readonly<TContext> =>
    Object.assign({}, ...services.map(s => s.context()));

  const paths = () :string[] => services.map(s => s.path());

  const send = <TPayload=any>(name: string, payload?: TPayload|Promise<TPayload>) =>
    services.forEach(s => s.send<TPayload>(name, payload));

  const makeMatchesFn = (
    positivMatchValue: boolean,
    fns: ((...paths: string[]) => boolean)[],
  ) => (...paths: string[]) => {
    for (let fn of fns) {
      if (fn(...paths)) return positivMatchValue;
    }
    return !positivMatchValue;
  };
  const matchesOne = makeMatchesFn(true, services.map(s => s.matchesOne));
  const matchesNone = makeMatchesFn(false, services.map(s => s.matchesNone));

  const onTransition = (callback: OnParallelTransitionFn<TContext>) :(() => void) => {
    const unsubscribers = services.map(s => s.onTransition(() => {
      callback(context(), paths());
    }));
    return () => unsubscribers.forEach(u => u());
  };

  return {context, paths, send, matchesOne, matchesNone, onTransition};
};
