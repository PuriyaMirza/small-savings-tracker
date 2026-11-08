import { describe, expect, it } from 'vitest';
import { isAllowedEmail } from './allowlist';

const ALLOWED = 'owner@example.com';

describe('isAllowedEmail', () => {
  it('allows the configured, verified address (case and spaces ignored)', () => {
    expect(isAllowedEmail('owner@example.com', true, ALLOWED)).toBe(true);
    expect(isAllowedEmail(' Owner@Example.com ', true, ALLOWED)).toBe(true);
  });

  it('refuses other accounts', () => {
    expect(isAllowedEmail('someone@example.com', true, ALLOWED)).toBe(false);
    expect(isAllowedEmail('owner@example.com.evil.com', true, ALLOWED)).toBe(false);
  });

  it('refuses unverified emails and missing values', () => {
    expect(isAllowedEmail('owner@example.com', false, ALLOWED)).toBe(false);
    expect(isAllowedEmail('owner@example.com', undefined, ALLOWED)).toBe(false);
    expect(isAllowedEmail(undefined, true, ALLOWED)).toBe(false);
  });

  it('refuses everyone when ALLOWED_EMAIL is not set', () => {
    expect(isAllowedEmail('owner@example.com', true, undefined)).toBe(false);
    expect(isAllowedEmail('owner@example.com', true, '  ')).toBe(false);
  });
});
