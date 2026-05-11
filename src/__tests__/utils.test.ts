import { describe, it, expect } from 'vitest';
import { estimateCost } from '../utils';

describe('estimateCost', () => {
  it('returns a formatted cost string for zero entries', () => {
    expect(estimateCost(0)).toMatch(/^~\$\d+\.\d{2}$/);
  });

  it('returns a dollar-formatted string for moderate entry counts', () => {
    const result = estimateCost(50);
    expect(result).toMatch(/^~\$\d+\.\d{2}$/);
  });

  it('cost increases as entry count grows', () => {
    const low = estimateCost(10);
    const high = estimateCost(500);
    const lowNum = parseFloat(low.replace(/[^0-9.]/g, ''));
    const highNum = parseFloat(high.replace(/[^0-9.]/g, ''));
    expect(highNum).toBeGreaterThan(lowNum);
  });
});
