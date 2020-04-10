type UpdatePartialDef<ContextType, EventType> = {
    [P in keyof ContextType]?: (ctx: ContextType, ev: EventType) => ContextType[P];
}

export interface EventDef<ContextType, EventType=any, NextEventType=any> {
  /**
   * Optional target path of event. Causes state transition. Can be a relative path.
   * The context must not be changed, otherwise unpredictable behavior might occur.
   */
  target?: string
  /**
   * Optional event conditional fn. If returns true, the event is executed.
   * The context passed to the cond fn is the actual current context.
   * The context must not be changed, otherwise unpredictable behavior might occur.
   */
  cond?: (ctx: ContextType, ev: EventType) => boolean
  /**
   * Optional replace fn. Allows for complete replacement of whole context.
   * The context passed to the replace fn is the actual current context.
   * A change is only accepted as such if the new context is different: a !== b
   */
  replace?: (ctx: ContextType, ev: EventType) => ContextType
  /**
   * Optional update fn. Updates one or many properties of the context.
   * The context passed to the update partial is a working copy of the original.
   * For every function in the partial the same working copy is used.
   * A change is only accepted as such if the new value is different: a !== b
   */
  update?: UpdatePartialDef<ContextType, EventType>
  /**
   * Optional tap fn. Taps into one or many properties of the context.
   * A tap function can be employed for side-effects that don't change the context.
   */
  tap?: (ctx: ContextType, ev: EventType) => void
  /**
   * Optional next event name of fn.
   * If event name is used, the original event is passed on.
   * If event fn is used, a payload transformation is expected that returns next event name and new even payload.
   * Use the helper fn Next<ContextType, EventType, NextEventType>(...) then for strong typing.
   */
  next?: string|((ctx: ContextType, eventA: EventType) => [string, NextEventType])
}

export interface EventErrorType {
  error: Error
}

type ChildStatesDef<ContextType> = { [key: string]: StateDef<ContextType> };

export interface StateDef<ContextType> {
  initial?: string|((ctx: ContextType) => string)
  entry?: string|EventDef<ContextType>|EventDef<ContextType>[] // TODO: NOT IMPLEMENTED YET
  on?: { [key: string]: string|EventDef<ContextType>|EventDef<ContextType>[] };
  states?: ChildStatesDef<ContextType>
}

export interface StateConfig<ContextType> {
  state: StateDef<ContextType>
  path: {name: string, absolute: string}
}

export interface MachineDef<ContextType> {
  context: ContextType
  initial: string|((ctx: ContextType) => string)
  states: ChildStatesDef<ContextType>
}

export type SendFn = <EventType=any>(name: string, event?: EventType|Promise<EventType>) => void;
export type OnTransitionFn<ContextType> = (ctx: ContextType, path: string) => void;

export interface Service<ContextType> {
  context: () => ContextType
  path: () => string
  send: SendFn
  matchesOne: (...paths: string[]) => boolean,
  matchesNone: (...paths: string[]) => boolean,
  onTransition: (callback: OnTransitionFn<ContextType>) => () => void
}

export interface CurrentMachineState<ContextType> {
  context: ContextType
  path: string
  matchesOne: (...paths: string[]) => boolean
  matchesNone: (...paths: string[]) => boolean
}
