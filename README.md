# CxState

CxState is a simplicity first finite state machine library inspired by XState. The "Cx" stands for "coding experience" or "comprehensible". Simplicity is the main design principle behind CxState.

Finite state machines like CxState are a modeling tool that helps to concisely and very precisely define the logic and state of a given software module. CxState may not only be used to streamline development of complex GUIs. It can be used beneficially wherever the concise modeling of program state represents an advantage for program stability. In the spirit of encapsulation it's usually best practice to use one state machine per module.

## Why would you want to use a state machine?

The probably best way from which to built up understanding for finite state machines in general and CxState in particular is from the direction of the event. The state machine you define is a blackbox that encapsulates all the logic that you would otherwise distribute all over your module. Every change must be expressed in the form of an event handler in your state machine. The only way you can communicate the need for a change is by sending events to this handlers (for which the state machine provides the infrastructure next to other things). Apart from that you're using the state machine to query it for state and variables (to determine your presentation for instance). You're never setting state or variables directly in order not to violate encapsulation and raise state determinability and predictability of behavior. All of this taken together helps to harden your module quite considerably.

## TOC

1. [Concepts](./CONCEPTS.md)
2. [Examples](./EXAMPLES.md)
3. [Why CxState](./WHY-CXSTATE.md)
