import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  canRequestReset,
  trackResetRequest,
} from "../../services/passwordResetService";

describe("passwordResetService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("requestPasswordReset()", () => {
    it("should return error if email is invalid", async () => {
      vi.useFakeTimers();

      const promise = requestPasswordReset("invalidEmail");

      // fast-forward setTimeout delay
      vi.advanceTimersByTime(1000);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe("Please provide a valid email address");

      vi.useRealTimers();
    });

    it("should store token, expiry, email in localStorage for valid email", async () => {
      vi.useFakeTimers();

      const promise = requestPasswordReset("user@example.com");

      vi.advanceTimersByTime(1000);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.message).toBe("Password reset email sent successfully");

      expect(result.resetToken).toBeTruthy();
      expect(result.expiresAt).toBeTruthy();

      expect(localStorage.getItem("reset_token")).toBe(result.resetToken);
      expect(localStorage.getItem("reset_token_expires")).toBe(result.expiresAt);
      expect(localStorage.getItem("reset_email")).toBe("user@example.com");

      vi.useRealTimers();
    });

    it("should return failure if an exception occurs", async () => {
      vi.useFakeTimers();

      // force localStorage.setItem to throw
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("localStorage failed");
        });

      const promise = requestPasswordReset("user@example.com");

      vi.advanceTimersByTime(1000);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Failed to send reset email. Please try again."
      );

      setItemSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe("validateResetToken()", () => {
    it("should return invalid if no stored token exists", async () => {
      vi.useFakeTimers();

      const promise = validateResetToken("some-token");

      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Invalid reset token");

      vi.useRealTimers();
    });

    it("should return invalid if token does not match", async () => {
      localStorage.setItem("reset_token", "correct-token");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() + 100000).toISOString()
      );

      vi.useFakeTimers();

      const promise = validateResetToken("wrong-token");

      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Invalid reset token");

      vi.useRealTimers();
    });

    it("should return invalid if token is expired", async () => {
      localStorage.setItem("reset_token", "token123");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() - 1000).toISOString()
      );

      vi.useFakeTimers();

      const promise = validateResetToken("token123");

      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Reset token has expired");

      vi.useRealTimers();
    });

    it("should return valid and email if token matches and not expired", async () => {
      localStorage.setItem("reset_token", "token123");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() + 60_000).toISOString()
      );
      localStorage.setItem("reset_email", "sid@example.com");

      vi.useFakeTimers();

      const promise = validateResetToken("token123");

      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.valid).toBe(true);
      expect(result.message).toBe("Valid reset token");
      expect(result.email).toBe("sid@example.com");

      vi.useRealTimers();
    });

    it("should fallback to default email if reset_email not found", async () => {
      localStorage.setItem("reset_token", "token123");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() + 60_000).toISOString()
      );

      vi.useFakeTimers();

      const promise = validateResetToken("token123");

      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.valid).toBe(true);
      expect(result.email).toBe("user@example.com");

      vi.useRealTimers();
    });
  });

  describe("resetPassword()", () => {
    it("should fail if token is invalid", async () => {
      vi.useFakeTimers();

      const promise = resetPassword("bad-token", "NewPassword123");

      // resetPassword waits 1200ms, then validateResetToken waits 800ms
      vi.advanceTimersByTime(1200);
      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid reset token");

      vi.useRealTimers();
    });

    it("should fail if password is too short", async () => {
      localStorage.setItem("reset_token", "token123");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() + 60_000).toISOString()
      );

      vi.useFakeTimers();

      const promise = resetPassword("token123", "short");

      vi.advanceTimersByTime(1200);
      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe("Password must be at least 8 characters long");

      vi.useRealTimers();
    });

    it("should reset password and clear localStorage tokens on success", async () => {
      localStorage.setItem("reset_token", "token123");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() + 60_000).toISOString()
      );
      localStorage.setItem("reset_email", "sid@example.com");

      vi.useFakeTimers();

      const promise = resetPassword("token123", "NewPassword123");

      vi.advanceTimersByTime(1200);
      vi.advanceTimersByTime(800);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.message).toBe("Password has been reset successfully");

      expect(localStorage.getItem("reset_token")).toBeNull();
      expect(localStorage.getItem("reset_token_expires")).toBeNull();
      expect(localStorage.getItem("reset_email")).toBeNull();

      vi.useRealTimers();
    });

    it("should return failure if exception happens", async () => {
      localStorage.setItem("reset_token", "token123");
      localStorage.setItem(
        "reset_token_expires",
        new Date(Date.now() + 60_000).toISOString()
      );

      // force validateResetToken() to throw by breaking localStorage.getItem
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("boom");
      });

      vi.useFakeTimers();

      const promise = resetPassword("token123", "NewPassword123");

      vi.advanceTimersByTime(1200);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to reset password. Please try again.");

      vi.useRealTimers();
    });
  });

  describe("canRequestReset()", () => {
    it("should return true if no previous request exists", () => {
      expect(canRequestReset("a@b.com")).toBe(true);
    });

    it("should return false if within cooldown period", () => {
      const email = "a@b.com";
      const now = new Date().toISOString();

      localStorage.setItem(`reset_request_${email}`, now);

      expect(canRequestReset(email)).toBe(false);
    });

    it("should return true if cooldown period has passed", () => {
      const email = "a@b.com";
      const oldTime = new Date(Date.now() - 6 * 60 * 1000).toISOString(); // 6 mins ago

      localStorage.setItem(`reset_request_${email}`, oldTime);

      expect(canRequestReset(email)).toBe(true);
    });
  });

  describe("trackResetRequest()", () => {
    it("should store reset request timestamp in localStorage", () => {
      const email = "sid@example.com";

      trackResetRequest(email);

      const stored = localStorage.getItem(`reset_request_${email}`);

      expect(stored).toBeTruthy();
      expect(new Date(stored as string).toString()).not.toBe("Invalid Date");
    });
  });
});
