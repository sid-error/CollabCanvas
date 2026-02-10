import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthProvider, useAuth } from "../../services/AuthContext";

// Helper component to access context functions
function TestComponent() {
  const { user, token, login, logout, updateUser } = useAuth();

  return (
    <div>
      <div data-testid="token">{token ?? "null"}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>

      <button onClick={() => login("TOKEN123", { id: 1, name: "Sid" })}>
        login
      </button>

      <button onClick={() => updateUser({ name: "Updated" })}>
        updateUser
      </button>

      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should initialize token from localStorage", () => {
    localStorage.setItem("auth_token", "ABC");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("token").textContent).toBe("ABC");
  });

  it("should initialize user from localStorage", () => {
    localStorage.setItem("user", JSON.stringify({ id: 99, name: "Test" }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toContain("Test");
  });

  it("should return null if user JSON in localStorage is invalid", () => {
    localStorage.setItem("user", "{bad json}");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("login() should set token/user and store them in localStorage", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByText("login"));

    expect(screen.getByTestId("token").textContent).toBe("TOKEN123");
    expect(screen.getByTestId("user").textContent).toContain("Sid");

    expect(localStorage.getItem("auth_token")).toBe("TOKEN123");
    expect(localStorage.getItem("user")).toContain("Sid");
  });

  it("updateUser() should merge and update localStorage", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // login first
    await user.click(screen.getByText("login"));

    // update user
    await user.click(screen.getByText("updateUser"));

    expect(screen.getByTestId("user").textContent).toContain("Updated");
    expect(localStorage.getItem("user")).toContain("Updated");
  });

  it("logout() should clear state and localStorage and redirect", async () => {
    const user = userEvent.setup();

    // mock redirect safely
    const assignMock = vi.fn();

    // overwrite location.assign
    Object.defineProperty(window, "location", {
      value: { assign: assignMock },
      writable: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // login first
    await user.click(screen.getByText("login"));

    expect(localStorage.getItem("auth_token")).toBe("TOKEN123");

    // logout
    await user.click(screen.getByText("logout"));

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();

    expect(screen.getByTestId("token").textContent).toBe("null");
    expect(screen.getByTestId("user").textContent).toBe("null");

    expect(assignMock).toHaveBeenCalledWith("/login");
  });

  it("useAuth should throw error if used outside AuthProvider", () => {
    // suppress React error output
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider"
    );
  });
});
