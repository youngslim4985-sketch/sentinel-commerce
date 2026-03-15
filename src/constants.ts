import { Brand, AgentEvent } from './types';

export interface DashboardState {
  brands: Brand[];
  events: AgentEvent[];
  isConnected: boolean;
  isEmergencyStop: boolean;
}

export const INITIAL_STATE: DashboardState = {
  brands: [],
  events: [],
  isConnected: false,
  isEmergencyStop: false,
};
