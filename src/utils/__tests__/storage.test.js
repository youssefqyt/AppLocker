/**
 * Tests for src/utils/storage.js
 * Covers: generatePinSuggestions, isSequential (via suggestions), DEFAULT_APPS, DEFAULT_SETTINGS
 */

import { generatePinSuggestions, DEFAULT_APPS, DEFAULT_SETTINGS } from '../storage';

// ─── generatePinSuggestions ─────────────────────────────────────────────────

describe('generatePinSuggestions()', () => {
  it('returns exactly 3 suggestions', () => {
    const suggestions = generatePinSuggestions();
    expect(suggestions).toHaveLength(3);
  });

  it('each suggestion has a 4-digit numeric pin', () => {
    const suggestions = generatePinSuggestions();
    suggestions.forEach(({ pin }) => {
      expect(pin).toMatch(/^\d{4}$/);
    });
  });

  it('each suggestion has a strength of "Strong" or "Medium"', () => {
    const suggestions = generatePinSuggestions();
    suggestions.forEach(({ strength }) => {
      expect(['Strong', 'Medium']).toContain(strength);
    });
  });

  it('each suggestion has a desc string', () => {
    const suggestions = generatePinSuggestions();
    suggestions.forEach(({ desc }) => {
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });
  });

  it('marks sequential PINs as "Medium"', () => {
    // We can't directly call isSequential, but we know 1234 and 4321 are sequential.
    // generatePinSuggestions is random so we test the logic directly by inspecting exported behaviour.
    const suggestions = generatePinSuggestions();
    suggestions.forEach(({ pin, strength }) => {
      const digits = pin.split('').map(Number);
      let asc = true, desc = true;
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== digits[i - 1] + 1) asc = false;
        if (digits[i] !== digits[i - 1] - 1) desc = false;
      }
      const isSeq = asc || desc;
      const allSame = new Set(pin.split('')).size < 2;
      if (isSeq || allSame) {
        expect(strength).toBe('Medium');
      }
    });
  });

  it('produces different PINs across calls (randomness check, 95% confidence)', () => {
    const setA = generatePinSuggestions().map(s => s.pin).join('');
    const setB = generatePinSuggestions().map(s => s.pin).join('');
    // There is a 1-in-10000^3 chance this fails legitimately; acceptable.
    expect(setA).not.toBe(setB);
  });
});

// ─── DEFAULT_APPS ───────────────────────────────────────────────────────────

describe('DEFAULT_APPS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(DEFAULT_APPS)).toBe(true);
    expect(DEFAULT_APPS.length).toBeGreaterThan(0);
  });

  it('every app has required fields', () => {
    DEFAULT_APPS.forEach(app => {
      expect(app).toHaveProperty('id');
      expect(app).toHaveProperty('name');
      expect(app).toHaveProperty('category');
      expect(app).toHaveProperty('icon');
      expect(app).toHaveProperty('color');
      expect(app).toHaveProperty('bgColor');
      expect(typeof app.locked).toBe('boolean');
    });
  });

  it('all app ids are unique', () => {
    const ids = DEFAULT_APPS.map(a => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('contains 12 apps', () => {
    expect(DEFAULT_APPS).toHaveLength(12);
  });

  it('some apps are locked by default', () => {
    const locked = DEFAULT_APPS.filter(a => a.locked);
    expect(locked.length).toBeGreaterThan(0);
  });

  it('some apps are unlocked by default', () => {
    const unlocked = DEFAULT_APPS.filter(a => !a.locked);
    expect(unlocked.length).toBeGreaterThan(0);
  });
});

// ─── DEFAULT_SETTINGS ───────────────────────────────────────────────────────

describe('DEFAULT_SETTINGS', () => {
  it('has biometrics: false by default', () => {
    expect(DEFAULT_SETTINGS.biometrics).toBe(false);
  });

  it('has notifications: true by default', () => {
    expect(DEFAULT_SETTINGS.notifications).toBe(true);
  });

  it('has a valid autoLock string', () => {
    expect(typeof DEFAULT_SETTINGS.autoLock).toBe('string');
  });

  it('has maxAttempts as a number >= 1', () => {
    expect(typeof DEFAULT_SETTINGS.maxAttempts).toBe('number');
    expect(DEFAULT_SETTINGS.maxAttempts).toBeGreaterThanOrEqual(1);
  });

  it('has hideContent boolean', () => {
    expect(typeof DEFAULT_SETTINGS.hideContent).toBe('boolean');
  });

  it('has a theme property', () => {
    expect(DEFAULT_SETTINGS).toHaveProperty('theme');
  });
});

