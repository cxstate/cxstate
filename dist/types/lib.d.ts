import { EventDef, StateConfig } from './types';
export declare function rebuildActiveStates<TContext>(currentState: StateConfig<TContext>, previousActiveStates: StateConfig<TContext>[], statePaths: StateConfig<TContext>[]): StateConfig<TContext>[];
export declare function findInitialChildState<TContext>(ctx: TContext, statePaths: StateConfig<TContext>[], parent: StateConfig<TContext>): StateConfig<TContext> | undefined;
export declare function updateContext<TContext, TPayload>(ctx: TContext, def: EventDef<TContext>, payload?: TPayload): TContext | undefined;
export declare function initialStateName<TContext>(initial: string | ((ctx: TContext) => string), ctx: TContext): string;
export declare function resolvePath(base: string, relativeComp: string): string;
