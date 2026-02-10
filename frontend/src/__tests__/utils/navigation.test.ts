import { openInNewTab, navigateToTop, isValidUrl } from "../../utils/navigation";

describe("navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("openInNewTab()", () => {
    test("should call window.open with correct arguments", () => {
      const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

      openInNewTab("https://example.com");

      expect(openSpy).toHaveBeenCalledWith(
        "https://example.com",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("navigateToTop()", () => {
    test("should navigate to the given path and scroll to top", () => {
      const navigate = jest.fn();
      const scrollSpy = jest.spyOn(window, "scrollTo").mockImplementation(() => {});

      navigateToTop(navigate, "/dashboard");

      expect(navigate).toHaveBeenCalledWith("/dashboard");
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("isValidUrl()", () => {
    test("should return true for valid URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://google.com")).toBe(true);
    });

    test("should return false for invalid URLs", () => {
      expect(isValidUrl("not a url")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false); // no protocol
      expect(isValidUrl("")).toBe(false);
    });
  });
});
