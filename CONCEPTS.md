# CxState concepts

[The word "module" is used for classes, GUI-components or modules interchangeably.]

Finite state machines like CxState are a modeling tool that helps to concisely and very precisely define the logic and state of a given software module. CxState may not only be used to streamline development of complex GUIs. It can be used beneficially wherever the concise modeling of program state represents an advantage for program stability. In the spirit of encapsulation it's usually best practice to use one state machine per module.

## Understanding event flow

The probably best way from which to built up understanding for finite state machines in general and CxState in particular is from the direction of the event. The state machine you define is a blackbox that encapsulates all the logic that you would otherwise distribute all over your module. Every change must be expressed in the form of an event handler in your state machine. The only way you can communicate the need for a change is by sending events to this handlers (for which the state machine provides the infrastructure next to other things). Apart from that you're using the state machine to query it for state and variables (to determine your presentation for instance). You're never setting state or variables directly in order not to violate encapsulation and raise state determinability and predictability of behavior. Thus hardening module logic.

## Machines

A machine defines all the states in which your module can be in. It also contains the context, which holds all variables your module uses. A machine defines so called transitions, which are changes from one state to another as well as a context that holds all variables of a module. One could say a machine encapsulates all logic and state of a module, thus separating it neatly from it's presentation.

## States

CxState represents states as paths. Imagine one state of your module as a name in a path. States can have sub-states, so that every condition your module can be in can be expressed as a path. States contain event definitions. Sub-states, also: child-states, can overwrite the events of their parent state. Sibling states can define the same set of events but react completely different to each. Events are bubbling up to parent states if they cannot be found in a child state.

A machine can be checked if it matches a certain state. Specific by providing a full path or rather unspecific by providing a parent path or relative path. Events without a definition in the respective state don't trigger any reaction of the machine, thus hardening the modeled logic and state.

## State transitions

This is one of the fundamentals of finite state machines. The change from one state to the other. The so called transition. Transitions are always caused by events and are described in the event definition by specifying the target path. Transitions can be expressed as relative paths akin to the "cd" terminal command.

## Events

An event consists of name and payload. The name is a string of uppercase characters, usually an imperative verb expressing what's supposed to be done. The payload contains variables. If the payload is a Promise, it's a "deferred event" (see below). Events are an implementation of a one-way messaging pattern. Events can cause state transitions and context mutations (changes of variables of the context). Both (transitions and mutations) are part of the event definition.

Events can be executed conditionally. That means the event will only execute it's context mutation and/or state transition if a condition is met. An event can consist of a stack of definitions, from which the first that fulfills the defined conditions is executed. If a stack of unconditional event definitions is provided, all will be executed.

## Context

The context encapsulates all variables required by the module. The context is accessible from outside the machine with all it's variables. Variables must not be mutated directly on the context. The purpose of the context is to express the current variable state of a module, for instance to make the variables accessible for presentation.

## Context mutation

If variables must be changed, this is called "mutating the context". Mutations must be defined within an event. Context mutations are defined together with state transitions as part of an event. Through the vehicle of context mutation triggered as part of events the state machine knows precisely at which point in time a module changes its internal variables. Thus state inconsistencies are prevented.

## Event composition sequences

Sometimes its preferable to reuse certain validation logic that must be applied at the end of several events. This can be achieved by composing events into a sequence. Default behavior is to pass the payload on to the next event unchanged. It's possible to transform the payload before it's passed on to the next event.

## Deferred events

Asynchronous behavior is supported by sending events that have promises as payload. The event will fire when the promise resolves or rejects. If another promise is fired for the same event name, before the previous promise could resolve, the new promise will replace the old one. Only the most recent promise fired for a specific event will be handed over to the event handler. Thus implicit debouncing behavior is implemented.

If this behavior is not desired, the promise must be sent contained in an event, that's not an instance of `Promise`. The receiving event can then transition into a specific state before passing the promise itself on as payload. Thus it's possible to easily define a concise state in which the machine is remaining while waiting for an asynchronous operation to complete.
