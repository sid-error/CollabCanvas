import * as logoutModule from "../../utils/logoutHandler";
import { performLogout } from "../../utils/logoutHandler";

describe("performLogout()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return early if confirmation enabled and user cancels", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);

    const clearSpy = jest.spyOn(logoutModule, "clearAuthTokens");

    await performLogout({ showConfirmation: true });

    expect(clearSpy).not.toHaveBeenCalled();
  });

  test("should clear tokens and redirect if confirmed", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const clearSpy = jest.spyOn(logoutModule, "clearAuthTokens");

    // ✅ mock window.location safely
    const locationSpy = jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ href: "" } as any);

    await performLogout({
      showConfirmation: true,
      showSuccess: false,
      redirectTo: "/login"
    });

    expect(clearSpy).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");

    locationSpy.mockRestore();
  });

  test("should not redirect if redirectTo is empty string", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const locationSpy = jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ href: "" } as any);

    await performLogout({
      showConfirmation: true,
      showSuccess: false,
      redirectTo: ""
    });

    expect(window.location.href).toBe("");

    locationSpy.mockRestore();
  });

  test("should skip confirmation if showConfirmation is false", async () => {
    const confirmSpy = jest.spyOn(window, "confirm");

    const locationSpy = jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ href: "" } as any);

    await performLogout({
      showConfirmation: false,
      showSuccess: false,
      redirectTo: "/login"
    });

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(window.location.href).toBe("/login");

    locationSpy.mockRestore();
  });
});
