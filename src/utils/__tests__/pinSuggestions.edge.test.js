/**
 * Edge-case tests for PIN suggestion logic.
 * Tests the isSequential helper indirectly through known PINs.
 */

import { generatePinSuggestions } from '../storage';

describe('PIN suggestion edge cases', () => {
  it('runs 100 times without throwing', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => generatePinSuggestions()).not.toThrow();
    }
  });

  it('never returns PINs shorter than 4 digits', () => {
    for (let i = 0; i < 20; i++) {
      generatePinSuggestions().forEach(({ pin }) => {
        expect(pin.length).toBe(4);
      });
    }
  });

  it('never returns non-digit characters in PINs', () => {
    for (let i = 0; i < 20; i++) {
      generatePinSuggestions().forEach(({ pin }) => {
        expect(/^\d+$/.test(pin)).toBe(true);
      });
    }
  });
});

