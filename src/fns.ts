import {
  EventDef,
  StateDef,
  MachineDef,
} from './types';

export const Event = <ContextType, EventType=any, NextEventType=any>(def: EventDef<ContextType, EventType, NextEventType>) => def;
export const Next = <ContextType, EventType, NextEventType>(fn: (ctx: ContextType, eventA: EventType) => [string, NextEventType]) => fn;
export const State = <ContextType>(def: StateDef<ContextType>) => def;
export const Machine = <ContextType>(def: MachineDef<ContextType>) => def;
