import { debounce } from '../../utils/debounce';

describe('utils/debounce.ts', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('should delay function execution until wait time passes', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('hello');

    // Not called immediately
    expect(fn).not.toHaveBeenCalled();

    // Still not called before 300ms
    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    // Called exactly after 300ms
    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('hello');
  });

  test('should only call the function once if called multiple times quickly', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('a');
    jest.advanceTimersByTime(100);

    debouncedFn('b');
    jest.advanceTimersByTime(100);

    debouncedFn('c');

    // Not called yet
    expect(fn).not.toHaveBeenCalled();

    // Move forward enough to trigger last call
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  test('should reset the timer each time it is called', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn('first');
    jest.advanceTimersByTime(400);

    // Call again before 500ms finishes
    debouncedFn('second');

    // If debounce did NOT reset, it would trigger soon — but it should not
    jest.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    // Now complete the full 500ms after second call
    jest.advanceTimersByTime(401);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  test('should pass multiple arguments correctly', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 200);

    debouncedFn('x', 123, { ok: true });

    jest.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('x', 123, { ok: true });
  });
});
