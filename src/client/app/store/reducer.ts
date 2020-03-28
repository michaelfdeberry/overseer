import { AnyAction } from './action.type';
import { actions } from './actions';
import { AppState } from './state';

function internalReducer(state: AppState, action: AnyAction): AppState {
  const { type, ...payload } = action;

  switch (type) {
    case actions.common.types.initialize:
      return { ...state, ...payload };
    case actions.common.types.setActiveUser:
      return { ...state, activeUser: payload };
    case actions.common.types.clearActiveUser:
      return { ...state, activeUser: undefined };
    case actions.common.types.updateSettings:
      return { ...state, settings: { ...state.settings, ...payload } };
    case actions.layout.types.notify:
      return { ...state, lastNotification: payload };
    case actions.layout.types.clearNotification:
      return { ...state, lastNotification: undefined };
    case actions.layout.types.updateTheme:
      return { ...state, currentTheme: payload.currentTheme };
    case actions.layout.types.startLoading:
      return { ...state, loading: (state.loading || 0) + 1 };
    case actions.layout.types.completeLoading:
      return { ...state, loading: Math.max(0, state.loading - 1) };
    case actions.layout.types.clearLoading:
      return { ...state, loading: undefined };
    case actions.users.types.addUser:
      return { ...state, users: [...state.users, payload] };
    case actions.users.types.removeUser:
      return { ...state, users: state.users.filter(u => u.id !== payload.id) };
    case actions.users.types.updateUser:
      return { ...state, users: state.users.map(u => (u.id === payload.id ? payload : u)) };
    case actions.users.types.updateUsers:
      return { ...state, users: payload.users };
    case actions.machines.types.addMachine:
      return { ...state, machines: [...state.machines, payload.machines] };
    case actions.machines.types.removeMachine:
      return { ...state, machines: state.machines.filter(m => m.id !== payload.machine.id) };
    case actions.machines.types.updateMachine:
      return { ...state, machines: state.machines.map(m => (m.id === payload.machine.id ? payload.machine : m)) };
    case actions.machines.types.updateMachines:
      return { ...state, machines: payload.machines };
    default:
      return state;
  }
}

function loggingReducer(state: AppState, action: AnyAction): AppState {
  const newState = internalReducer(state, action);

  console.groupCollapsed(action.type);
  console.log('previous state', state);
  console.log('action', action);
  console.log('current state', state);
  console.groupEnd();

  return newState;
}

export const reducer = __isDev__ ? loggingReducer : internalReducer;
