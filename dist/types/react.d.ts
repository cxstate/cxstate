import { MachineDef, SendFn, CurrentMachineState } from './types';
export declare function useMachine<ContextType>(machineDef: MachineDef<ContextType>): [CurrentMachineState<ContextType>, SendFn];
