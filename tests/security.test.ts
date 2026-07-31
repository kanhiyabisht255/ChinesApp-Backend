import { hasActivePremium } from '../src/services/entitlement.service';
import { assertJwtConfigured, extractToken, generateToken, verifyToken } from '../src/utils/jwt';
import { normalizePhone } from '../src/utils/otp';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('authentication helpers', () => {
  test('extracts only Bearer tokens', () => {
    expect(extractToken('Bearer token-value')).toBe('token-value');
    expect(extractToken('Basic token-value')).toBeNull();
    expect(extractToken(undefined)).toBeNull();
  });

  test('signs and verifies application JWTs', () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-tests';
    const payload = { userId: 'user-1', phone: '+919876543210', isPremium: false };

    const token = generateToken(payload);

    expect(verifyToken(token)).toEqual(expect.objectContaining(payload));
    expect(verifyToken(`${token}broken`)).toBeNull();
  });

  test('rejects missing JWT secret in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    expect(assertJwtConfigured).toThrow('JWT_SECRET must be configured');
  });
});

describe('phone normalization', () => {
  test.each([
    ['+91 98765-43210', '+919876543210'],
    ['1 (415) 555-2671', '+14155552671'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  test.each([undefined, null, '', '1234', '1234567890123456'])('rejects invalid value %p', input => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe('premium entitlement', () => {
  test('accepts an unexpired subscription', () => {
    expect(hasActivePremium({ isPremium: true, premiumExpiry: new Date(Date.now() + 60_000) })).toBe(true);
  });

  test('rejects an expired subscription even if the cached premium flag is still true', () => {
    expect(hasActivePremium({ isPremium: true, premiumExpiry: new Date(Date.now() - 60_000) })).toBe(false);
  });

  test('accepts lifetime premium without an expiry date', () => {
    expect(hasActivePremium({ isPremium: true })).toBe(true);
  });
});
