import { MachineDef, Service } from './types';
/**
 * Internprets a machine-definition. Returns a ready to use machine-service.
 */
export declare function interpret<ContextType>(machineDef: MachineDef<ContextType>): Service<ContextType>;
