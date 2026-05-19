import { describe, expect, it } from 'vitest';
import {
  generateBioCode,
  isValidBioCodeShape,
  bioCodeBelongsToUser,
} from './bio-code';

describe('generateBioCode', () => {
  it('produces the documented PR-xxxxx-xxxxx shape', () => {
    const code = generateBioCode('user-1', 'ebay');
    expect(code).toMatch(/^PR-[a-f0-9]{5}-[a-f0-9]{5}$/);
  });

  it('is deterministic for the same user + platform', () => {
    const a = generateBioCode('user-1', 'vinted');
    const b = generateBioCode('user-1', 'vinted');
    expect(a).toBe(b);
  });

  it('differs for different platforms with the same user', () => {
    const a = generateBioCode('user-1', 'vinted');
    const b = generateBioCode('user-1', 'kleinanzeigen');
    expect(a).not.toBe(b);
  });

  it('differs for different users on the same platform', () => {
    const a = generateBioCode('user-1', 'vinted');
    const b = generateBioCode('user-2', 'vinted');
    expect(a).not.toBe(b);
  });
});

describe('isValidBioCodeShape', () => {
  it('accepts well-formed codes', () => {
    expect(isValidBioCodeShape('PR-abc12-def34')).toBe(true);
  });

  it.each([
    'pr-abc12-def34',
    'PR-ABC12-def34',
    'PR-abc12-def3',
    'PR-abc12def34',
    'PR-abc12-def345',
    '',
  ])('rejects malformed code %s', (code) => {
    expect(isValidBioCodeShape(code)).toBe(false);
  });
});

describe('bioCodeBelongsToUser', () => {
  it('accepts the code generated for that user', () => {
    const code = generateBioCode('user-42', 'ebay');
    expect(bioCodeBelongsToUser(code, 'user-42')).toBe(true);
  });

  it('rejects a code generated for a different user', () => {
    const code = generateBioCode('user-1', 'ebay');
    expect(bioCodeBelongsToUser(code, 'user-2')).toBe(false);
  });

  it('rejects a malformed code', () => {
    expect(bioCodeBelongsToUser('not-a-code', 'user-1')).toBe(false);
  });
});
