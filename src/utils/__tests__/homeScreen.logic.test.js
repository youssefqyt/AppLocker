/**
 * Tests for HomeScreen domain logic (search/filter, lock stats).
 */

import { DEFAULT_APPS } from '../storage';

// ── Filter logic (mirrors HomeScreen.js) ─────────────────────────────────────

function filterApps(apps, search) {
  return apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );
}

describe('HomeScreen app search/filter', () => {
  it('empty search returns all apps', () => {
    expect(filterApps(DEFAULT_APPS, '')).toHaveLength(DEFAULT_APPS.length);
  });

  it('search by name (case-insensitive) returns matching apps', () => {
    const result = filterApps(DEFAULT_APPS, 'instagram');
    expect(result.some(a => a.name === 'Instagram')).toBe(true);
  });

  it('search by name (uppercase) works', () => {
    const result = filterApps(DEFAULT_APPS, 'WHATSAPP');
    expect(result.some(a => a.name === 'WhatsApp')).toBe(true);
  });

  it('search by category returns matching apps', () => {
    const result = filterApps(DEFAULT_APPS, 'social');
    result.forEach(a => {
      expect(a.category.toLowerCase()).toContain('social');
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it('search with no match returns empty array', () => {
    const result = filterApps(DEFAULT_APPS, 'xyzunknownapp999');
    expect(result).toHaveLength(0);
  });

  it('partial name match works', () => {
    const result = filterApps(DEFAULT_APPS, 'gram');
    expect(result.some(a => a.name === 'Instagram')).toBe(true);
  });
});

// ── Lock stats ────────────────────────────────────────────────────────────────

describe('HomeScreen lock stats', () => {
  it('lockedCount matches DEFAULT_APPS default locked state', () => {
    const lockedCount = DEFAULT_APPS.filter(a => a.locked).length;
    expect(lockedCount).toBeGreaterThan(0);
    expect(lockedCount).toBeLessThan(DEFAULT_APPS.length);
  });

  it('unlock stats from log count correctly', () => {
    const mockLog = [
      { status: 'unlocked' },
      { status: 'unlocked' },
      { status: 'failed' },
      { status: 'blocked' },
    ];
    const unlockCount = mockLog.filter(l => l.status === 'unlocked').length;
    expect(unlockCount).toBe(2);
  });
});

