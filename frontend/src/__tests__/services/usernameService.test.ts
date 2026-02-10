import { checkUsernameAvailability } from '../../services/usernameService';

describe('checkUsernameAvailability', () => {
  it('should reject usernames shorter than 3 chars', async () => {
    const result = await checkUsernameAvailability('ab');

    expect(result.available).toBe(false);
    expect(result.message).toBe('Username must be at least 3 characters');
  });

  it('should reject usernames longer than 20 chars', async () => {
    const result = await checkUsernameAvailability('a'.repeat(21));

    expect(result.available).toBe(false);
    expect(result.message).toBe('Username must be less than 20 characters');
  });

  it('should reject invalid characters', async () => {
    const result = await checkUsernameAvailability('hello@123');

    expect(result.available).toBe(false);
    expect(result.message).toBe(
      'Username can only contain letters, numbers, dots, hyphens, and underscores'
    );
  });

  it('should detect taken username and return suggestions', async () => {
    const result = await checkUsernameAvailability('john_doe');

    expect(result.available).toBe(false);
    expect(result.message).toBe('Username is already taken');
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions?.length).toBeGreaterThan(0);
  });

  it('should allow new username', async () => {
    const result = await checkUsernameAvailability('new_user_999');

    expect(result.available).toBe(true);
    expect(result.message).toBe('Username is available!');
  });

  it('should treat username case-insensitively', async () => {
    const result = await checkUsernameAvailability('JoHn_DoE');

    expect(result.available).toBe(false);
    expect(result.message).toBe('Username is already taken');
  });

  it('should trim spaces before checking', async () => {
    const result = await checkUsernameAvailability('   john_doe   ');

    expect(result.available).toBe(false);
    expect(result.message).toBe('Username is already taken');
  });
});
