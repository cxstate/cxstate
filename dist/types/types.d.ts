declare type UpdatePartialDef<ContextType, EventType> = {
    [P in keyof ContextType]?: (ctx: ContextType, ev: EventType) => ContextType[P];
};
export interface EventDef<ContextType, EventType = any, NextEventType = any> {
    target?: string;
    cond?: (ctx: ContextType, ev: EventType) => boolean;
    replace?: (ctx: ContextType, ev: EventType) => ContextType;
    update?: UpdatePartialDef<ContextType, EventType>;
    next?: string | ((ctx: ContextType, eventA: EventType) => [string, NextEventType]);
}
export interface EventErrorType {
    error: Error;
}
declare type ChildStatesDef<ContextType> = {
    [key: string]: StateDef<ContextType>;
};
export interface StateDef<ContextType> {
    initial?: string | ((ctx: ContextType) => string);
    entry?: string | EventDef<ContextType> | EventDef<ContextType>[];
    on?: {
        [key: string]: string | EventDef<ContextType> | EventDef<ContextType>[];
    };
    states?: ChildStatesDef<ContextType>;
}
export interface StateConfig<ContextType> {
    state: StateDef<ContextType>;
    path: {
        name: string;
        absolute: string;
    };
}
export interface MachineDef<ContextType> {
    context: ContextType;
    initial: string | ((ctx: ContextType) => string);
    states: ChildStatesDef<ContextType>;
}
export declare type SendFn = <EventType = any>(name: string, event?: EventType | Promise<EventType>) => void;
export declare type OnTransitionFn<ContextType> = (ctx: ContextType, path: string) => void;
export interface Service<ContextType> {
    context: () => ContextType;
    path: () => string;
    send: SendFn;
    matchesOne: (...paths: string[]) => boolean;
    matchesNone: (...paths: string[]) => boolean;
    onTransition: (callback: OnTransitionFn<ContextType>) => () => void;
}
export interface CurrentMachineState<ContextType> {
    context: ContextType;
    path: string;
    matchesOne: (...paths: string[]) => boolean;
    matchesNone: (...paths: string[]) => boolean;
}
export {};
