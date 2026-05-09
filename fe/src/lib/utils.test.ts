import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fmtCurrency, fmtDate, fmtCountdown, generateIdempotencyKey } from './utils';

describe('Frontend Utils', () => {
  describe('fmtCurrency', () => {
    it('should format numbers to VND currency string', () => {
      // Note: Intl format might use non-breaking space depending on environment
      const result = fmtCurrency(1000000).replace(/\s/g, ' ');
      expect(result).toMatch(/1\.000\.000\s?₫/);
    });
  });

  describe('fmtDate', () => {
    it('should format date string to DD/MM/YYYY', () => {
      const date = '2026-12-01T00:00:00Z';
      expect(fmtDate(date)).toBe('01/12/2026');
    });
  });

  describe('fmtCountdown', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should format countdown correctly', () => {
      const now = new Date('2026-01-01T10:00:00Z');
      vi.setSystemTime(now);

      const expiredAt = new Date('2026-01-01T10:05:30Z').toISOString();
      expect(fmtCountdown(expiredAt)).toBe('5:30');
    });

    it('should return "Đã hết hạn" if expired', () => {
      const now = new Date('2026-01-01T10:10:00Z');
      vi.setSystemTime(now);

      const expiredAt = new Date('2026-01-01T10:05:30Z').toISOString();
      expect(fmtCountdown(expiredAt)).toBe('Đã hết hạn');
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate a unique string', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();
      expect(key1).not.toBe(key2);
      expect(key1).toMatch(/^\d+-/);
    });
  });
});
