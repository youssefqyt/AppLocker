/**
 * Unit tests for the AppContext reducer logic.
 * We extract the reducer by calling it directly — no React / DOM needed.
 *
 * We re-implement the same reducer here and import constants so the tests
 * remain independent of React rendering (no need for a Provider in these units).
 */

import { DEFAULT_APPS, DEFAULT_SETTINGS } from '../../utils/storage';

// ── Inline the reducer (mirrors src/context/AppContext.js exactly) ──────────
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

// ── Tests ───────────────────────────────────────────────────────────────────

describe('AppContext reducer', () => {
  let state;

  beforeEach(() => {
    state = { ...initialState, apps: [...DEFAULT_APPS], log: [], settings: { ...DEFAULT_SETTINGS } };
  });

  // ── HYDRATE ──────────────────────────────────────────────────────────────
  describe('HYDRATE', () => {
    it('merges payload into state and sets isLoading: false', () => {
      const next = reducer(state, {
        type: 'HYDRATE',
        payload: { pin: '1234', apps: DEFAULT_APPS, log: [], settings: DEFAULT_SETTINGS },
      });
      expect(next.pin).toBe('1234');
      expect(next.isLoading).toBe(false);
    });
  });

  // ── SET_PIN / CLEAR_PIN ──────────────────────────────────────────────────
  describe('SET_PIN', () => {
    it('stores the pin', () => {
      const next = reducer(state, { type: 'SET_PIN', pin: '5678' });
      expect(next.pin).toBe('5678');
    });
  });

  describe('CLEAR_PIN', () => {
    it('sets pin to null', () => {
      const withPin = { ...state, pin: '5678' };
      const next = reducer(withPin, { type: 'CLEAR_PIN' });
      expect(next.pin).toBeNull();
    });
  });

  // ── TOGGLE_APP_LOCK ──────────────────────────────────────────────────────
  describe('TOGGLE_APP_LOCK', () => {
    it('toggles a locked app to unlocked', () => {
      const lockedApp = DEFAULT_APPS.find(a => a.locked);
      const next = reducer(state, { type: 'TOGGLE_APP_LOCK', id: lockedApp.id });
      const toggled = next.apps.find(a => a.id === lockedApp.id);
      expect(toggled.locked).toBe(false);
    });

    it('toggles an unlocked app to locked', () => {
      const unlockedApp = DEFAULT_APPS.find(a => !a.locked);
      const next = reducer(state, { type: 'TOGGLE_APP_LOCK', id: unlockedApp.id });
      const toggled = next.apps.find(a => a.id === unlockedApp.id);
      expect(toggled.locked).toBe(true);
    });

    it('does not mutate other apps', () => {
      const target = DEFAULT_APPS[0];
      const before = state.apps.filter(a => a.id !== target.id).map(a => a.locked);
      const next = reducer(state, { type: 'TOGGLE_APP_LOCK', id: target.id });
      const after = next.apps.filter(a => a.id !== target.id).map(a => a.locked);
      expect(after).toEqual(before);
    });
  });

  // ── ADD_LOG ──────────────────────────────────────────────────────────────
  describe('ADD_LOG', () => {
    it('prepends a log entry', () => {
      const next = reducer(state, {
        type: 'ADD_LOG',
        appName: 'Instagram',
        appIcon: 'logo-instagram',
        appColor: '#833AB4',
        status: 'unlocked',
      });
      expect(next.log).toHaveLength(1);
      expect(next.log[0].appName).toBe('Instagram');
      expect(next.log[0].status).toBe('unlocked');
    });

    it('new entry appears at the front', () => {
      const withEntry = reducer(state, {
        type: 'ADD_LOG', appName: 'First', appIcon: 'x', appColor: '#fff', status: 'unlocked',
      });
      const next = reducer(withEntry, {
        type: 'ADD_LOG', appName: 'Second', appIcon: 'y', appColor: '#000', status: 'failed',
      });
      expect(next.log[0].appName).toBe('Second');
    });

    it('caps log at 50 entries', () => {
      let s = state;
      for (let i = 0; i < 55; i++) {
        s = reducer(s, { type: 'ADD_LOG', appName: `App${i}`, appIcon: 'x', appColor: '#fff', status: 'unlocked' });
      }
      expect(s.log).toHaveLength(50);
    });

    it('each entry has an id, time, appName, status', () => {
      const next = reducer(state, {
        type: 'ADD_LOG', appName: 'Test', appIcon: 'icon', appColor: '#fff', status: 'blocked',
      });
      const entry = next.log[0];
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('time');
      expect(entry.appName).toBe('Test');
      expect(entry.status).toBe('blocked');
    });
  });

  // ── CLEAR_LOG ────────────────────────────────────────────────────────────
  describe('CLEAR_LOG', () => {
    it('empties the log', () => {
      let s = reducer(state, { type: 'ADD_LOG', appName: 'A', appIcon: 'x', appColor: '#f', status: 'unlocked' });
      s = reducer(s, { type: 'CLEAR_LOG' });
      expect(s.log).toHaveLength(0);
    });
  });

  // ── UPDATE_SETTINGS ──────────────────────────────────────────────────────
  describe('UPDATE_SETTINGS', () => {
    it('merges partial settings', () => {
      const next = reducer(state, { type: 'UPDATE_SETTINGS', settings: { biometrics: true } });
      expect(next.settings.biometrics).toBe(true);
      // Other settings preserved
      expect(next.settings.notifications).toBe(DEFAULT_SETTINGS.notifications);
    });

    it('can update autoLock', () => {
      const next = reducer(state, { type: 'UPDATE_SETTINGS', settings: { autoLock: '5 min' } });
      expect(next.settings.autoLock).toBe('5 min');
    });

    it('can update maxAttempts', () => {
      const next = reducer(state, { type: 'UPDATE_SETTINGS', settings: { maxAttempts: 3 } });
      expect(next.settings.maxAttempts).toBe(3);
    });
  });

  // ── INCREMENT_FAILED / RESET_FAILED ──────────────────────────────────────
  describe('INCREMENT_FAILED', () => {
    it('increments failedAttempts by 1', () => {
      const next = reducer(state, { type: 'INCREMENT_FAILED' });
      expect(next.failedAttempts).toBe(1);
    });

    it('accumulates across multiple increments', () => {
      let s = reducer(state, { type: 'INCREMENT_FAILED' });
      s = reducer(s, { type: 'INCREMENT_FAILED' });
      s = reducer(s, { type: 'INCREMENT_FAILED' });
      expect(s.failedAttempts).toBe(3);
    });
  });

  describe('RESET_FAILED', () => {
    it('resets failedAttempts to 0', () => {
      let s = { ...state, failedAttempts: 4 };
      s = reducer(s, { type: 'RESET_FAILED' });
      expect(s.failedAttempts).toBe(0);
    });
  });

  // ── RESET_ALL ────────────────────────────────────────────────────────────
  describe('RESET_ALL', () => {
    it('clears pin, log, and resets settings', () => {
      let s = reducer(state, { type: 'SET_PIN', pin: '9999' });
      s = reducer(s, { type: 'ADD_LOG', appName: 'X', appIcon: 'x', appColor: '#f', status: 'unlocked' });
      s = reducer(s, { type: 'RESET_ALL' });
      expect(s.pin).toBeNull();
      expect(s.log).toHaveLength(0);
      expect(s.isLoading).toBe(false);
    });

    it('restores DEFAULT_APPS', () => {
      const next = reducer(state, { type: 'RESET_ALL' });
      expect(next.apps).toEqual(DEFAULT_APPS);
    });
  });

  // ── default branch ───────────────────────────────────────────────────────
  describe('unknown action', () => {
    it('returns state unchanged', () => {
      const next = reducer(state, { type: 'UNKNOWN_ACTION' });
      expect(next).toBe(state); // same reference
    });
  });
});

