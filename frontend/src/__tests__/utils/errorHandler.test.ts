import {
  AUTH_ERRORS,
  getAuthErrorMessage,
  displayErrorMessage,
  logError
} from '../../utils/errorHandler';

describe('utils/errorHandler.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthErrorMessage()', () => {
    test('should map string containing "invalid" to INVALID_CREDENTIALS', () => {
      const result = getAuthErrorMessage('Invalid credentials');
      expect(result).toEqual(AUTH_ERRORS.INVALID_CREDENTIALS);
    });

    test('should map string containing "network" to NETWORK_ERROR', () => {
      const result = getAuthErrorMessage('Network connection failed');
      expect(result).toEqual(AUTH_ERRORS.NETWORK_ERROR);
    });

    test('should map string containing "verified" to EMAIL_NOT_VERIFIED', () => {
      const result = getAuthErrorMessage('Email not verified');
      expect(result).toEqual(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
    });

    test('should map string containing "locked" to ACCOUNT_LOCKED', () => {
      const result = getAuthErrorMessage('Account locked');
      expect(result).toEqual(AUTH_ERRORS.ACCOUNT_LOCKED);
    });

    test('should map string containing "rate limit" to RATE_LIMITED', () => {
      const result = getAuthErrorMessage('Rate limit exceeded');
      expect(result).toEqual(AUTH_ERRORS.RATE_LIMITED);
    });

    test('should map error.response.status 401 to INVALID_CREDENTIALS', () => {
      const result = getAuthErrorMessage({ response: { status: 401 } });
      expect(result).toEqual(AUTH_ERRORS.INVALID_CREDENTIALS);
    });

    test('should map error.response.status 403 to ACCOUNT_LOCKED', () => {
      const result = getAuthErrorMessage({ response: { status: 403 } });
      expect(result).toEqual(AUTH_ERRORS.ACCOUNT_LOCKED);
    });

    test('should map error.response.status 423 to EMAIL_NOT_VERIFIED', () => {
      const result = getAuthErrorMessage({ response: { status: 423 } });
      expect(result).toEqual(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
    });

    test('should map error.response.status 429 to RATE_LIMITED', () => {
      const result = getAuthErrorMessage({ response: { status: 429 } });
      expect(result).toEqual(AUTH_ERRORS.RATE_LIMITED);
    });

    test('should map error.response.status 500 to SERVER_ERROR', () => {
      const result = getAuthErrorMessage({ response: { status: 500 } });
      expect(result).toEqual(AUTH_ERRORS.SERVER_ERROR);
    });

    test('should map error.message containing "Network Error" to NETWORK_ERROR', () => {
      const result = getAuthErrorMessage({ message: 'Network Error' });
      expect(result).toEqual(AUTH_ERRORS.NETWORK_ERROR);
    });

    test('should return default UNKNOWN error if nothing matches', () => {
      const result = getAuthErrorMessage({ random: true }, 'Custom fallback');

      expect(result).toEqual({
        code: 'UNKNOWN',
        title: 'Error',
        message: 'Custom fallback',
        type: 'error'
      });
    });

    test('should use default fallback message if not provided', () => {
      const result = getAuthErrorMessage({ random: true });

      expect(result).toEqual({
        code: 'UNKNOWN',
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error'
      });
    });
  });

  describe('displayErrorMessage()', () => {
    test('should call alert with formatted message and correct icon', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      displayErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);

      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith(
        `❌ Invalid Credentials\n\nThe email or password you entered is incorrect. Please try again.`
      );

      alertSpy.mockRestore();
    });

    test('should show warning icon for warning type', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      displayErrorMessage(AUTH_ERRORS.EMAIL_NOT_VERIFIED);

      expect(alertSpy).toHaveBeenCalledWith(
        `⚠️ Email Not Verified\n\nPlease verify your email address before logging in. Check your inbox for the verification email.`
      );

      alertSpy.mockRestore();
    });
  });

  describe('logError()', () => {
    test('should call console.error with context and structured object', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const err = new Error('Boom');
      logError(err, 'LoginPage');

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      const callArgs = consoleSpy.mock.calls[0];

      // First argument: "[LoginPage]"
      expect(callArgs[0]).toBe('[LoginPage]');

      // Second argument: structured object
      expect(callArgs[1]).toHaveProperty('timestamp');
      expect(callArgs[1]).toHaveProperty('error', 'Boom');
      expect(callArgs[1]).toHaveProperty('stack');
      expect(callArgs[1]).toHaveProperty('code');
      expect(callArgs[1]).toHaveProperty('response');

      consoleSpy.mockRestore();
    });

    test('should use default context "Authentication" if none provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      logError('Something bad');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy.mock.calls[0][0]).toBe('[Authentication]');

      consoleSpy.mockRestore();
    });
  });
});
