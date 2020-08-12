// Update

type UpdatePartialDef<TContext, TPayload> = {
  [P in keyof TContext]?: (ctx: TContext, pl: TPayload) => TContext[P]
}

// Events

export interface EventDef<TContext, TPayload = any, TNextPayload = any> {
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
  next?: string | ((ctx: TContext, inputPl: TPayload) => [string, TNextPayload])
}

export interface EventErrorType {
  error: Error
}

// States

export type StateActionsDef<TContext> = {
  [key: string]: string | EventDef<TContext> | EventDef<TContext>[]
}

export type ChildStatesDef<TContext> = {
  [key: string]: StateDef<TContext>
}

export interface StateDef<TContext> {
  initial?: string | ((ctx: TContext) => string)
  entry?: string | EventDef<TContext> | EventDef<TContext>[]
  on?: StateActionsDef<TContext>
  states?: ChildStatesDef<TContext>
}

export interface StateConfig<TContext> {
  state: StateDef<TContext>
  path: { name: string; absolute: string }
}

// Machines

export interface MachineDef<TContext> {
  context: TContext
  initial: string | ((ctx: TContext) => string)
  states: ChildStatesDef<TContext>
}

// Functions

export type SendFn = <TPayload = any>(name: string, payload?: TPayload | Promise<TPayload>) => void

export type OnTransitionFn<TContext> = (ctx: TContext, path: string) => void
export type OnParallelTransitionFn<TContext> = (ctx: TContext, paths: string[]) => void

// Services

interface ServiceBase<TContext> {
  context: () => Readonly<TContext>
  send: SendFn
  matchesOne: (...paths: string[]) => boolean
  matchesNone: (...paths: string[]) => boolean
}

export interface Service<TContext> extends ServiceBase<TContext> {
  path: () => string
  onTransition: (callback: OnTransitionFn<TContext>) => () => void
}

export interface ParallelService<TContext> extends ServiceBase<TContext> {
  paths: () => string[]
  onTransition: (callback: OnParallelTransitionFn<TContext>) => () => void
}
