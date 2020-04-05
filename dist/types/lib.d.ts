import { EventDef, StateConfig } from './types';
export declare function rebuildActiveStates<ContextType>(currentState: StateConfig<ContextType>, previousActiveStates: StateConfig<ContextType>[], statePaths: StateConfig<ContextType>[]): StateConfig<ContextType>[];
export declare function findInitialChildState<ContextType>(ctx: ContextType, statePaths: StateConfig<ContextType>[], parent: StateConfig<ContextType>): StateConfig<ContextType> | undefined;
export declare function updateContext<ContextType, EventType>(ctx: ContextType, def: EventDef<ContextType>, event?: EventType): ContextType | undefined;
export declare function initialStateName<ContextType>(initial: string | ((ctx: ContextType) => string), ctx: ContextType): string;
export declare function resolvePath(base: string, relativeComp: string): string;
