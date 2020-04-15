import {
  EventDef,
  StateDef,
  MachineDef,
} from './types';

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
