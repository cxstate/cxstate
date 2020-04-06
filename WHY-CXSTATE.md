## Why CxState instead of XState?

This document summarizes my reasons for re-implementing XState in the form of CxState. The problems described herein are based on day-to-day usage in programming with XState as a finite state machine for GUIs. This document is a critique.

### 1. Incomprehensible error messages:

What you see below is an example of XStates' usual way of marking errors, even the very small ones:

**An example error message for XState**

 ```ascii
 No overload matches this call.
Overload 1 of 2, '(config: MachineConfig<Context, any, AnyEventObject>, options?: Partial<MachineOptions<Context, AnyEventObject>> | undefined, initialContext?: Context | undefined): StateMachine<...>', gave the following error.
  Type '{ compatibilityUnknown: { entry: SendAction<Context, EventObject>; on: { SET_COMPATIBILITY_REPORT: { target: string; actions: AssignAction<Context, EventObject>; }; }; }; ... 8 more ...; signedIn: { ...; }; }' is not assignable to type 'StatesConfig<Context, any, AnyEventObject>'.
    Property 'testState' is incompatible with index signature.
      Type '{ on: { DO_SOMETHING: { actions: AssignAction<{ whatever: null; }, AnyEventObject>; }; }; }' is not assignable to type 'StateNodeConfig<Context, any, AnyEventObject>'.
        Types of property 'on' are incompatible.
          Type '{ DO_SOMETHING: { actions: AssignAction<{ whatever: null; }, AnyEventObject>; }; }' is not assignable to type 'TransitionsConfigMap<Context, AnyEventObject> | TransitionsConfigArray<Context, AnyEventObject> | undefined'.
            Type '{ DO_SOMETHING: { actions: AssignAction<{ whatever: null; }, AnyEventObject>; }; }' is not assignable to type 'undefined'.
Overload 2 of 2, '(config: MachineConfig<Context, any, AnyEventObject>, options?: Partial<MachineOptions<Context, AnyEventObject>> | undefined, initialContext?: Context | undefined): StateMachine<...>', gave the following error.
  Type '{ compatibilityUnknown: { entry: SendAction<Context, EventObject>; on: { SET_COMPATIBILITY_REPORT: { target: string; actions: AssignAction<Context, EventObject>; }; }; }; ... 8 more ...; signedIn: { ...; }; }' is not assignable to type 'StatesConfig<Context, any, AnyEventObject>'.
    Property 'testState' is incompatible with index signature.
      Type '{ on: { DO_SOMETHING: { actions: AssignAction<{ whatever: null; }, AnyEventObject>; }; }; }' is not assignable to type 'StateNodeConfig<Context, any, AnyEventObject>'.
        Types of property 'on' are incompatible.
          Type '{ DO_SOMETHING: { actions: AssignAction<{ whatever: null; }, AnyEventObject>; }; }' is not assignable to type 'TransitionsConfigMap<Context, AnyEventObject> | TransitionsConfigArray<Context, AnyEventObject> | undefined'.
            Type '{ DO_SOMETHING: { actions: AssignAction<{ whatever: null; }, AnyEventObject>; }; }' is not assignable to type 'undefined'.
 ```

Please especially note the abundance of API overloads: `... 8 more ...` and ellipsed-out details `...` all over the place, which make debugging a guessing game.

**The same error in CxState:**

```ascii
Type '{ testState: { on: { DO_SOMETHING: { update: { whatever: () => null; }; }; }; }; invalid: {}; valid: {}; }' is not assignable to type 'ChildStatesDef<Context>'.
  Property 'testState' is incompatible with index signature.
    Type '{ on: { DO_SOMETHING: { update: { whatever: () => null; }; }; }; }' is not assignable to type 'StateDef<Context>'.
      Types of property 'on' are incompatible.
        Type '{ DO_SOMETHING: { update: { whatever: () => null; }; }; }' is not assignable to type '{ [key: string]: string | EventDef<Context, any, any> | EventDef<Context, any, any>[]; }'.
          Property 'DO_SOMETHING' is incompatible with index signature.
            Type '{ update: { whatever: () => null; }; }' is not assignable to type 'string | EventDef<Context, any, any> | EventDef<Context, any, any>[]'.
              Type '{ update: { whatever: () => null; }; }' is not assignable to type 'string'.
```

The apparent difference is: XStates' error messages' signal-to-noise ratio is so poor, that this aspect of it must seriously be called an impediment in the day-to-day usage of the framework. CxState on the other hand demonstrates what is possible if the APIs and the type system are designed for simplicity. The error messages are short and concise. TypeScript is able to extract more precisely what went wrong, something that it struggles with on XState.

The programming language used is TypeScript in both cases. So the cause for this kind of incomprehensible error messages is not TypeScript, but the choices that where made by designing the respective type systems.

**If your goal is to develop software efficiently it's of utmost importance to get comprehensible feedback from the tools you use. The errors must be concise, on the point and understandable. Simplicity should be the main-goal when designing APIs and type systems. If achieved well enough, the tool becomes predictable. The best thing for being productive is to push unnecessary complications down towards zero.**

### 2. Overloading overload:

XStates' APIs are heavily overloaded (see `... 8 more ...` in the error message above). Everything can be used in many different ways. I guess the reason behind this is to be as unbiased as possible towards different ways of usage. From a distance this might be a honorable goal. However there's a dark side to it: Choosing to follow this path can raise complexity quite significantly. As the code base gets way more complex, the probability of errors raises and with it are raising maintenance, testing and documentation costs. Additionally there might be downsides concerning runtime efficiency. I guess this "overloading overload" might actually be the cause for the incomprehensible error messages (see 1.) of XState.

**In my opinion an opinionated API with likewise usage patterns might be a good price to pay if it's reducing the amount of overall unnecessary complexity. The choice is between active investment in simplicity vs. trying to please everyone and ignoring the costs that come with it (something not everyone can effort).**

### 3. Conceptual grandeur

The domain language of XState is mostly based on SCXML. So if you get into it, you'll be confronted with a conceptual domain filled with grandeur and splendor, where some words might have a different meaning from what you know and this is reflected in the documentation of XState. Here's a tiny taste of what you get:

**XState conceptual domain**

> Machines · States · State Nodes · Events · Transitions · Hierarchical State Nodes · Parallel State Nodes · Effects · Actions · Guarded Transitions · Context · Activities · Invoking Services · Actors · Delayed Events and Transitions · Final States · History · Identifying State Nodes · Interpreting Machines

Most of this complexity unfortunately is not meaningful for 95% of the ways you're going to use XState in. Some of the crucial points (like services for instance) come with hidden and unexpected stumbling blocks. Some requirements are unnecessarily complex to do. This is why CxState simplifies the conceptional domain down to the following:

**CxState conceptual domain**

> Machines · States · Context · Context mutation · Events · State transitions · Event composition sequences · Deferred events

CxStates API is for the most part very similar to the one of XState. However CxState replaces the concept of invoking services with **deferred events** and **event sequences**. By that reducing the complexity of a machine definition together with the LOCs. Though CxState doesn't support parallel states within one machine; but due to it's efficiency has enough headroom to allow for two separate machines in place of one.

### 4. Better composability

Event compositions sequences and deferred events are the 2 major differentiation factors where CxState shows a more modular approach. In my opinion the path chosen by XState does not allow for the amount of composability and reusability that would actually be possible on the conceptual foundation.

### 5. Stronger typing

Though XState is written in TypeScript it's actual typing in event handlers is very weak. The reason behind this is the type system. CxState's type system on the other hand is designed around very strong typing without over-complicating the API. You'll find the helper functions Event<...>(...), Next<...>(...), State<...>(...) and  Machine<...>(...) to help with this.

Learn more about CxState:

[CONCEPTS](CONCEPTS.md) · [EXAMPLES](EXAMPLES.md) · [API](docs) · [README](README.md)
