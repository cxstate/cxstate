import { EventDef, StateDef, MachineDef } from './types';
export declare const Event: <ContextType, EventType = any, NextEventType = any>(def: EventDef<ContextType, EventType, NextEventType>) => EventDef<ContextType, EventType, NextEventType>;
export declare const Next: <ContextType, EventType, NextEventType>(fn: (ctx: ContextType, eventA: EventType) => [string, NextEventType]) => (ctx: ContextType, eventA: EventType) => [string, NextEventType];
export declare const State: <ContextType>(def: StateDef<ContextType>) => StateDef<ContextType>;
export declare const Machine: <ContextType>(def: MachineDef<ContextType>) => MachineDef<ContextType>;
