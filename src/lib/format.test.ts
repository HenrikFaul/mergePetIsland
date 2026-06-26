import { describe, it, expect } from 'vitest';
import { formatNumber, formatDuration } from './format';

describe('formatNumber', () => {
  it('formats small and unit-scaled numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1200)).toBe('1.2K');
    expect(formatNumber(1_500_000)).toBe('1.5M');
  });

  it('rolls rounding overflow into the next unit (no "1000K")', () => {
    expect(formatNumber(999_999)).toBe('1M');
    expect(formatNumber(999_999_999)).toBe('1B');
  });
});

describe('formatDuration', () => {
  it('formats h/m/s', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3661)).toBe('1h 1m');
  });
});
