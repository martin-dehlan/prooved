import { describe, expect, it } from 'vitest';
import { SLUG_REGEX, RESERVED_SLUGS, slugSchema, suggestSlug } from './slug';

describe('SLUG_REGEX', () => {
  it.each([
    'abc',
    'abc123',
    'a1-b2-c3',
    'max-mustermann',
    '0abc',
    'a'.repeat(32),
  ])('matches valid slug %s', (s) => {
    expect(SLUG_REGEX.test(s)).toBe(true);
  });

  it.each([
    '',
    'ab',
    '-abc',
    'abc-',
    'Abc',
    'abc def',
    'abc_def',
    'a'.repeat(33),
    'абв',
  ])('rejects invalid slug %s', (s) => {
    expect(SLUG_REGEX.test(s)).toBe(false);
  });
});

describe('slugSchema', () => {
  it('accepts a valid slug', () => {
    expect(slugSchema.safeParse('max-mustermann').success).toBe(true);
  });

  it('rejects slugs that are too short', () => {
    expect(slugSchema.safeParse('ab').success).toBe(false);
  });

  it('rejects reserved slugs', () => {
    for (const reserved of ['admin', 'api', 'dashboard', 'de']) {
      expect(slugSchema.safeParse(reserved).success).toBe(false);
    }
  });
});

describe('RESERVED_SLUGS', () => {
  it('contains core route segments', () => {
    expect(RESERVED_SLUGS.has('api')).toBe(true);
    expect(RESERVED_SLUGS.has('dashboard')).toBe(true);
    expect(RESERVED_SLUGS.has('admin')).toBe(true);
  });

  it('contains the locale prefixes', () => {
    expect(RESERVED_SLUGS.has('de')).toBe(true);
    expect(RESERVED_SLUGS.has('en')).toBe(true);
  });
});

describe('suggestSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(suggestSlug('Max Mustermann')).toBe('max-mustermann');
  });

  it('expands German umlauts', () => {
    expect(suggestSlug('Müller Über Ärger Straße')).toBe('mueller-ueber-aerger-strasse');
  });

  it('strips leading and trailing hyphens', () => {
    expect(suggestSlug('---hello world---')).toBe('hello-world');
  });

  it('caps the result at 32 characters', () => {
    expect(suggestSlug('a'.repeat(100)).length).toBeLessThanOrEqual(32);
  });

  it('drops non-alphanumeric characters', () => {
    expect(suggestSlug('hello@world.com!')).toBe('hello-world-com');
  });
});
