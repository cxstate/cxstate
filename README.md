# CxState

CxState is a simplicity first finite state machine library inspired by XState. The "Cx" stands for "coding experience" or "comprehensible". Simplicity is the main design principle behind CxState. The main differentiation factors of CxState are:

- Stronger typing: CxState's type system allows for more comprehensible error messages
- Reduced conceptual complexity: CxState's main concept is the event (in a messaging pattern); if you get that, you're done with the learning curve
- Better composability: Events in CxState are very modular, mix and match them as you like

Finite state machines like CxState are a modeling tool that helps to concisely and very precisely define the behavior and state of a given software module. CxState may not only be used to harden the behavior of complex GUIs, it can be used beneficially wherever the concise modeling of program state represents an advantage for program stability. In the spirit of encapsulation it's usually best practice to use one state machine per module.

## Quick start

[React quick start below]

```bash
npm i -S @cxstate/cxstate
```

Basic framework-agnostic integration looks like this:

```ts
import { interpret } from '@cxstate/cxstate';
// Assuming a machine definition, context and event interfaces in ./machine.ts
import { Context, machine, DoEvent } from './machine';

const service = interpret<Context>(machine);
service.onTransition((context: Context, path: string) => {
  // Your presentation should be re-rendered
});

// Sending strong typed events to the machine
service.send<DoEvent>('DO_SOMETHING', {value: 'a value'});

// Query for current state
if (service.matchesOne('/state/path/a', '/state/path/b')) {
  // Machine is in state '/state/path/a' or '/state/path/b'
}
if (service.matchesNone('/state/path/a', '/state/path/b')) {
  // Machine is neither in state '/state/path/a' or '/state/path/b'
}

// Using context variables
<h1>{{ service.context().header }}</h1>
```

## React quick start

```bash
npm i -S @cxstate/cxstate @cxstate/react
```

To use the react hook, additionally install `@cxstate/react` and use it as follows:

```ts
import { useMachine } from '@cxstate/react';
// Assuming a machine definition, context and event interfaces in ./machine.ts
import { Context, machine, DoEvent } from './machine';

const [current, send] = useMachine<Context>(machine);

// Sending strong typed events to the machine
send<DoEvent>('DO_SOMETHING', {value: 'a value'});

// Conditional rendering if current state is '/state/path/a' or '/state/path/b'
{ current.matchesOne('/state/path/a', '/state/path/b')) && <h1>{{ current.context.headerAOrB }}</h1> }

// Conditional rendering if current state is neither '/state/path/a' or '/state/path/b'
{ current.matchesNone('/state/path/a', '/state/path/b')) && <h1>{{ current.context.neitherHeaderAOrB }}</h1> }
```

## Why would you want to use a state machine?

The probably best way from which to built up understanding for finite state machines in general and CxState in particular is from the direction of the event. The state machine you define is a blackbox that encapsulates all the logic that you would otherwise distribute all over your module. Every change must be expressed in the form of an event handler in your state machine. The only way you can communicate the need for a change is by sending events to this handlers (for which the state machine provides the infrastructure next to other things). Apart from that you're using the state machine to query it for state and variables (to determine your presentation for instance). You're never setting state or variables directly in order not to violate encapsulation and raise state determinability and predictability of behavior. Thus hardening module logic.

## TOC

1. [Concepts](./CONCEPTS.md)
2. [Examples](./EXAMPLES.md)
3. [Why CxState](./WHY-CXSTATE.md)
