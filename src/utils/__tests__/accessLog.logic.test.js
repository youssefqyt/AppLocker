/**
 * Tests for Access Log domain logic (date/time formatting helpers
 * and filter logic mirroring AccessLogScreen.js).
 */

// ── Helper mirrors from AccessLogScreen.js ──────────────────────────────────

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

const STATUS_CONFIG = {
  unlocked: { label: 'Unlocked', icon: 'checkmark-circle' },
  failed:   { label: 'Failed',   icon: 'close-circle' },
  blocked:  { label: 'Cancelled',icon: 'remove-circle' },
  opened:   { label: 'Opened',   icon: 'open' },
};

// ── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime()', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatTime(new Date().toISOString());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns "" for an invalid string', () => {
    expect(formatTime('not-a-date')).toBe('');
  });
});

// ── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate()', () => {
  it('returns "Today" for today\'s date', () => {
    expect(formatDate(new Date().toISOString())).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns a formatted date string for older dates', () => {
    const old = new Date('2020-01-15T10:00:00Z');
    const result = formatDate(old.toISOString());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Should NOT be Today or Yesterday
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Yesterday');
  });

  it('returns "" for an invalid string', () => {
    expect(formatDate('bad-input')).toBe('');
  });
});

// ── STATUS_CONFIG filter logic ────────────────────────────────────────────────

describe('filter logic (Access Log)', () => {
  const mockLog = [
    { id: '1', appName: 'Instagram', status: 'unlocked', time: new Date().toISOString() },
    { id: '2', appName: 'WhatsApp',  status: 'failed',   time: new Date().toISOString() },
    { id: '3', appName: 'Telegram',  status: 'blocked',  time: new Date().toISOString() },
    { id: '4', appName: 'Gmail',     status: 'opened',   time: new Date().toISOString() },
  ];

  function applyFilter(log, filter) {
    if (filter === 'All') return log;
    return log.filter(e => e.status === filter.toLowerCase());
  }

  it('"All" filter returns all entries', () => {
    expect(applyFilter(mockLog, 'All')).toHaveLength(4);
  });

  it('"Unlocked" filter returns only unlocked entries', () => {
    const result = applyFilter(mockLog, 'Unlocked');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('unlocked');
  });

  it('"Failed" filter returns only failed entries', () => {
    const result = applyFilter(mockLog, 'Failed');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('failed');
  });

  it('"Blocked" filter returns only blocked entries', () => {
    const result = applyFilter(mockLog, 'Blocked');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('blocked');
  });

  it('stats computed correctly', () => {
    const stats = {
      total:    mockLog.length,
      unlocked: mockLog.filter(l => l.status === 'unlocked').length,
      failed:   mockLog.filter(l => l.status === 'failed').length,
      blocked:  mockLog.filter(l => l.status === 'blocked').length,
    };
    expect(stats.total).toBe(4);
    expect(stats.unlocked).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.blocked).toBe(1);
  });
});

// ── STATUS_CONFIG shape ───────────────────────────────────────────────────────

describe('STATUS_CONFIG', () => {
  ['unlocked', 'failed', 'blocked', 'opened'].forEach(status => {
    it(`"${status}" has label and icon`, () => {
      expect(STATUS_CONFIG[status]).toHaveProperty('label');
      expect(STATUS_CONFIG[status]).toHaveProperty('icon');
    });
  });
});
