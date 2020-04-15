import { EventDef, StateDef, MachineDef, Service, ParallelService } from './types';
export declare const Event: <TContext, TPayload = any, TNextPayload = any>(def: EventDef<TContext, TPayload, TNextPayload>) => EventDef<TContext, TPayload, TNextPayload>;
export declare const Next: <TContext, TPayload, TNextPayload>(fn: (ctx: TContext, inputPayload: TPayload) => [string, TNextPayload]) => (ctx: TContext, inputPayload: TPayload) => [string, TNextPayload];
export declare const State: <TContext>(def: StateDef<TContext>) => StateDef<TContext>;
export declare const Machine: <TContext>(def: MachineDef<TContext>) => MachineDef<TContext>;
export declare const DeferredNextEvent: <TContext = any, TPayload = any, TNextPayload = void>(nextEventName: string, deferredFn: (ctx: TContext, payload: TPayload) => Promise<TNextPayload>) => EventDef<TContext, TPayload, any>;
export declare const parallelize: <TContext>(...services: Service<Partial<TContext>>[]) => ParallelService<TContext>;
