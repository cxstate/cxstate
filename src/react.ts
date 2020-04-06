import { useEffect, useState } from 'react';
import { interpret } from '.';
import { MachineDef, Service, SendFn, CurrentMachineState } from './types';

interface HookState<ContextType> {
  path: string
  context: ContextType;
}

export function useMachine<ContextType>(machineDef: MachineDef<ContextType>) :[CurrentMachineState<ContextType>, SendFn] {
  const [service] = useState<Service<ContextType>>(
    () => interpret<ContextType>(machineDef),
  );
  const [state, setState] = useState<HookState<ContextType>>({
    path: service.path(),
    context: service.context(),
  });
  useEffect(
    () => service.onTransition((context: ContextType, path: string) => {
      setState({context, path});
    }),
    [service, setState],
  );
  return [
    {
      ...state,
      matchesOne: service.matchesOne,
      matchesNone: service.matchesNone,
    },
    service.send,
  ];
}
