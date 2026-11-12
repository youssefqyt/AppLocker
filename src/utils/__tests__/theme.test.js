/**
 * Tests for src/utils/theme.js
 * Covers: COLORS, FONTS, RADIUS, SPACING exports and their shape/values
 */

import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

describe('COLORS', () => {
  const requiredKeys = [
    'bg', 'surface', 'surface2', 'surface3',
    'accent', 'accentLight', 'accent2',
    'text', 'textMuted', 'textDim',
    'success', 'successBg', 'danger', 'dangerBg',
    'warning', 'warningBg', 'border', 'borderLight', 'white',
  ];

  requiredKeys.forEach(key => {
    it(`has "${key}" as a valid hex color string`, () => {
      expect(COLORS).toHaveProperty(key);
      expect(typeof COLORS[key]).toBe('string');
      expect(COLORS[key]).toMatch(/^#[0-9A-Fa-f]{3,8}$/);
    });
  });

  it('bg is a dark color (low brightness)', () => {
    // #0E1120 — the red channel should be < 50 (hex 0E = 14)
    const hex = COLORS.bg.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    expect(r).toBeLessThan(50);
  });
});

describe('FONTS', () => {
  it('has regular, medium, semibold, bold', () => {
    expect(FONTS.regular).toBe('400');
    expect(FONTS.medium).toBe('500');
    expect(FONTS.semibold).toBe('600');
    expect(FONTS.bold).toBe('700');
  });
});

describe('RADIUS', () => {
  it('has sm, md, lg, xl, xxl in ascending order', () => {
    expect(RADIUS.sm).toBeLessThan(RADIUS.md);
    expect(RADIUS.md).toBeLessThan(RADIUS.lg);
    expect(RADIUS.lg).toBeLessThan(RADIUS.xl);
    expect(RADIUS.xl).toBeLessThan(RADIUS.xxl);
  });

  it('all values are positive numbers', () => {
    Object.values(RADIUS).forEach(v => {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThan(0);
    });
  });
});

describe('SPACING', () => {
  it('has xs, sm, md, lg, xl, xxl, xxxl', () => {
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'].forEach(key => {
      expect(SPACING).toHaveProperty(key);
    });
  });

  it('values increase from xs → xxxl', () => {
    expect(SPACING.xs).toBeLessThan(SPACING.sm);
    expect(SPACING.sm).toBeLessThan(SPACING.md);
    expect(SPACING.md).toBeLessThan(SPACING.lg);
    expect(SPACING.lg).toBeLessThan(SPACING.xl);
    expect(SPACING.xl).toBeLessThan(SPACING.xxl);
    expect(SPACING.xxl).toBeLessThan(SPACING.xxxl);
  });
});

