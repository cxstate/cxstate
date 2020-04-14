import {
  EventDef,
  StateDef,
  MachineDef,
} from './types';

export const Event = <ContextType, PayloadType=any, NextPayloadType=any>(def: EventDef<ContextType, PayloadType, NextPayloadType>) => def;
export const Next = <ContextType, PayloadType, NextPayloadType>(fn: (ctx: ContextType, inputPayload: PayloadType) => [string, NextPayloadType]) => fn;
export const State = <ContextType>(def: StateDef<ContextType>) => def;
export const Machine = <ContextType>(def: MachineDef<ContextType>) => def;

export const DeferredNextEvent = <ContextType=any, PayloadType=any, NextPayloadType=void>(
  nextEventName: string,
  deferredFn: (ctx: ContextType, payload: PayloadType) => Promise<NextPayloadType>,
) => Event<ContextType, PayloadType>({
  next: Next<ContextType, PayloadType, Promise<NextPayloadType>>(
    (ctx: ContextType, payload: PayloadType) => [
      nextEventName,
      deferredFn(ctx, payload),
    ],
  ),
});
