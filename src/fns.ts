import {
  EventDef,
  StateDef,
  MachineDef,
} from './types';

export const Event = <ContextType, EventType=any, NextEventType=any>(def: EventDef<ContextType, EventType, NextEventType>) => def;
export const Next = <ContextType, EventType, NextEventType>(fn: (ctx: ContextType, eventA: EventType) => [string, NextEventType]) => fn;
export const State = <ContextType>(def: StateDef<ContextType>) => def;
export const Machine = <ContextType>(def: MachineDef<ContextType>) => def;

export const DeferredNextEvent = <ContextType=any, EventType=any, NextEventType=void>(
  nextEventName: string,
  deferredFn: (ctx: ContextType, payload: EventType) => Promise<NextEventType>,
) => Event<ContextType, EventType>({
  next: Next<ContextType, EventType, Promise<NextEventType>>(
    (ctx: ContextType, payload: EventType) => [
      nextEventName,
      deferredFn(ctx, payload),
    ],
  ),
});
