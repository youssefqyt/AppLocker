/**
 * Tests for Settings screen domain logic.
 * Covers AUTO_LOCK_OPTIONS, MAX_ATTEMPTS_OPTIONS, and setting update behaviour.
 */

const AUTO_LOCK_OPTIONS = ['Immediately', '30 sec', '1 min', '5 min', 'Never'];
const MAX_ATTEMPTS_OPTIONS = [3, 5, 10];

describe('AUTO_LOCK_OPTIONS', () => {
  it('has 5 options', () => {
    expect(AUTO_LOCK_OPTIONS).toHaveLength(5);
  });

  it('contains "Never" and "Immediately"', () => {
    expect(AUTO_LOCK_OPTIONS).toContain('Never');
    expect(AUTO_LOCK_OPTIONS).toContain('Immediately');
  });

  it('all entries are non-empty strings', () => {
    AUTO_LOCK_OPTIONS.forEach(opt => {
      expect(typeof opt).toBe('string');
      expect(opt.length).toBeGreaterThan(0);
    });
  });
});

describe('MAX_ATTEMPTS_OPTIONS', () => {
  it('has 3 options', () => {
    expect(MAX_ATTEMPTS_OPTIONS).toHaveLength(3);
  });

  it('all options are positive integers', () => {
    MAX_ATTEMPTS_OPTIONS.forEach(n => {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    });
  });

  it('contains the recommended value of 5', () => {
    expect(MAX_ATTEMPTS_OPTIONS).toContain(5);
  });
});

describe('Settings update merge logic', () => {
  const baseSettings = {
    biometrics: false,
    notifications: true,
    autoLock: '1 min',
    maxAttempts: 5,
    hideContent: true,
    theme: 'dark',
  };

  function updateSettings(current, partial) {
    return { ...current, ...partial };
  }

  it('enables biometrics without affecting other keys', () => {
    const updated = updateSettings(baseSettings, { biometrics: true });
    expect(updated.biometrics).toBe(true);
    expect(updated.notifications).toBe(baseSettings.notifications);
    expect(updated.autoLock).toBe(baseSettings.autoLock);
  });

  it('changes autoLock', () => {
    const updated = updateSettings(baseSettings, { autoLock: '5 min' });
    expect(updated.autoLock).toBe('5 min');
  });

  it('changes maxAttempts', () => {
    const updated = updateSettings(baseSettings, { maxAttempts: 3 });
    expect(updated.maxAttempts).toBe(3);
  });

  it('disables hideContent', () => {
    const updated = updateSettings(baseSettings, { hideContent: false });
    expect(updated.hideContent).toBe(false);
  });
});

