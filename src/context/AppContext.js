import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Storage, DEFAULT_APPS, DEFAULT_SETTINGS } from '../utils/storage';

const AppContext = createContext(null);

const initialState = {
  pin: null,
  apps: DEFAULT_APPS,
  log: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  failedAttempts: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, isLoading: false };

    case 'SET_PIN':
      return { ...state, pin: action.pin };

    case 'CLEAR_PIN':
      return { ...state, pin: null };

    case 'TOGGLE_APP_LOCK': {
      const apps = state.apps.map(a =>
        a.id === action.id ? { ...a, locked: !a.locked } : a
      );
      return { ...state, apps };
    }

    case 'ADD_LOG': {
      const entry = {
        id: Date.now().toString(),
        appName: action.appName,
        appIcon: action.appIcon,
        appColor: action.appColor,
        status: action.status,
        time: new Date().toISOString(),
      };
      const log = [entry, ...state.log].slice(0, 50);
      return { ...state, log };
    }

    case 'CLEAR_LOG':
      return { ...state, log: [] };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'INCREMENT_FAILED':
      return { ...state, failedAttempts: state.failedAttempts + 1 };

    case 'RESET_FAILED':
      return { ...state, failedAttempts: 0 };

    case 'RESET_ALL':
      return { ...initialState, apps: DEFAULT_APPS, settings: DEFAULT_SETTINGS, isLoading: false };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function hydrate() {
      const [pin, apps, log, settings] = await Promise.all([
        Storage.getPin(),
        Storage.getApps(),
        Storage.getLog(),
        Storage.getSettings(),
      ]);
      dispatch({
        type: 'HYDRATE',
        payload: {
          pin: pin || null,
          apps: apps || DEFAULT_APPS,
          log: log || [],
          settings: settings || DEFAULT_SETTINGS,
        },
      });
    }
    hydrate();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      Storage.setApps(state.apps);
      Storage.setLog(state.log);
      Storage.setSettings(state.settings);
    }
  }, [state.apps, state.log, state.settings, state.isLoading]);

  const actions = {
    setPin: async (pin) => {
      await Storage.setPin(pin);
      dispatch({ type: 'SET_PIN', pin });
    },
    clearPin: async () => {
      await Storage.clearPin();
      dispatch({ type: 'CLEAR_PIN' });
    },
    toggleAppLock: (id) => dispatch({ type: 'TOGGLE_APP_LOCK', id }),
    addLog: (appName, appIcon, appColor, status) =>
      dispatch({ type: 'ADD_LOG', appName, appIcon, appColor, status }),
    clearLog: () => dispatch({ type: 'CLEAR_LOG' }),
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
    incrementFailed: () => dispatch({ type: 'INCREMENT_FAILED' }),
    resetFailed: () => dispatch({ type: 'RESET_FAILED' }),
    resetAll: async () => {
      await Storage.clearAll();
      dispatch({ type: 'RESET_ALL' });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
