type UpdatePartialDef<TContext, TPayload> = {
    [P in keyof TContext]?: (ctx: TContext, pl: TPayload) => TContext[P];
}

export interface EventDef<TContext, TPayload=any, TNextPayload=any> {
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
  cond?: (ctx: TContext, pl: TPayload) => boolean
  /**
   * Optional replace fn. Allows for complete replacement of whole context.
   * The context passed to the replace fn is the actual current context.
   * A change is only accepted as such if the new context is different: a !== b
   */
  replace?: (ctx: TContext, pl: TPayload) => TContext
  /**
   * Optional update fn. Updates one or many properties of the context.
   * The context passed to the update partial is a working copy of the original.
   * For every function in the partial the same working copy is used.
   * A change is only accepted as such if the new value is different: a !== b
   */
  update?: UpdatePartialDef<TContext, TPayload>
  /**
   * Optional tap fn. Taps into one or many properties of the context.
   * A tap function can be employed for side-effects that don't change the context.
   */
  tap?: (ctx: TContext, pl: TPayload) => void
  /**
   * Optional next event name of fn.
   * If event name is used, the original event is passed on.
   * If event fn is used, a payload transformation is expected that returns next event name and new even payload.
   * Use the helper fn Next<TContext, TPayload, TNextPayload>(...) then for strong typing.
   */
  next?: string|((ctx: TContext, inputPl: TPayload) => [string, TNextPayload])
}

export interface EventErrorType {
  error: Error
}

type ChildStatesDef<TContext> = { [key: string]: StateDef<TContext> };

export interface StateDef<TContext> {
  initial?: string|((ctx: TContext) => string)
  entry?: string|EventDef<TContext>|EventDef<TContext>[] // TODO: NOT IMPLEMENTED YET
  on?: { [key: string]: string|EventDef<TContext>|EventDef<TContext>[] };
  states?: ChildStatesDef<TContext>
}

export interface StateConfig<TContext> {
  state: StateDef<TContext>
  path: {name: string, absolute: string}
}

export interface MachineDef<TContext> {
  context: TContext
  initial: string|((ctx: TContext) => string)
  states: ChildStatesDef<TContext>
}

export type SendFn = <TPayload=any>(name: string, payload?: TPayload|Promise<TPayload>) => void;
export type OnTransitionFn<TContext> = (ctx: TContext, path: string) => void;

export interface Service<TContext> {
  context: () => Readonly<TContext>
  path: () => string
  send: SendFn
  matchesOne: (...paths: string[]) => boolean,
  matchesNone: (...paths: string[]) => boolean,
  onTransition: (callback: OnTransitionFn<TContext>) => () => void
}

export interface CurrentMachineState<TContext> {
  context: Readonly<TContext>
  path: string
  matchesOne: (...paths: string[]) => boolean
  matchesNone: (...paths: string[]) => boolean
}
