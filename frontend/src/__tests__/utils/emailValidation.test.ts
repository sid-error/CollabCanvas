import {
  validateEmailFormat,
  sendVerificationEmail,
  verifyEmailToken,
  resendVerificationEmail
} from '../../utils/emailValidation';

describe('utils/emailValidation.ts', () => {
  describe('validateEmailFormat()', () => {
    test('should return invalid if email is empty', () => {
      const result = validateEmailFormat('');
      expect(result).toEqual({ valid: false, message: 'Email is required' });
    });

    test('should return invalid if email is only whitespace', () => {
      const result = validateEmailFormat('   ');
      expect(result).toEqual({ valid: false, message: 'Email is required' });
    });

    test('should return invalid for wrong email format', () => {
      const result = validateEmailFormat('not-an-email');
      expect(result).toEqual({
        valid: false,
        message: 'Please enter a valid email address'
      });
    });

    test('should return valid for correct email format', () => {
      const result = validateEmailFormat('user@example.com');
      expect(result).toEqual({ valid: true, message: 'Email format is valid' });
    });

    test('should reject disposable email domains', () => {
      const result = validateEmailFormat('user@tempmail.com');
      expect(result).toEqual({
        valid: false,
        message: 'Disposable email addresses are not allowed'
      });
    });

    test('should reject disposable domains even if uppercase', () => {
      const result = validateEmailFormat('user@TempMail.com');
      expect(result).toEqual({
        valid: false,
        message: 'Disposable email addresses are not allowed'
      });
    });
  });

  describe('sendVerificationEmail()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('should resolve success after delay and log output', async () => {
      const promise = sendVerificationEmail('user@example.com', 'artist123');

      // fast-forward the 1000ms timeout
      jest.advanceTimersByTime(1000);

      const result = await promise;

      expect(console.log).toHaveBeenCalledWith(
        'Verification email sent to: user@example.com for user: artist123'
      );

      expect(result).toEqual({
        success: true,
        message: 'Verification email sent successfully'
      });
    });
  });

  describe('verifyEmailToken()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('should return success for valid token', async () => {
      const promise = verifyEmailToken('this-is-a-valid-token');

      jest.advanceTimersByTime(800);

      const result = await promise;

      expect(result).toEqual({
        success: true,
        message: 'Email verified successfully!',
        email: 'user@example.com'
      });
    });

    test('should return failure for short token', async () => {
      const promise = verifyEmailToken('short');

      jest.advanceTimersByTime(800);

      const result = await promise;

      expect(result).toEqual({
        success: false,
        message: 'Invalid or expired verification token'
      });
    });

    test('should return failure for empty token', async () => {
      const promise = verifyEmailToken('');

      jest.advanceTimersByTime(800);

      const result = await promise;

      expect(result).toEqual({
        success: false,
        message: 'Invalid or expired verification token'
      });
    });
  });

  describe('resendVerificationEmail()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('should resolve success after delay and log output', async () => {
      const promise = resendVerificationEmail('user@example.com');

      jest.advanceTimersByTime(1000);

      const result = await promise;

      expect(console.log).toHaveBeenCalledWith(
        'Resent verification email to: user@example.com'
      );

      expect(result).toEqual({
        success: true,
        message: 'Verification email has been resent. Please check your inbox.'
      });
    });
  });
});
