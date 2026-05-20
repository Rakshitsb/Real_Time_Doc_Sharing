/**
 * @file useAuthGuard.test.js
 * Tests for the multi-tab logout sync hook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useAuthGuard from "../hooks/useAuthGuard";

// Mock storage utilities
vi.mock("../utils/storage", () => ({
  getAuthToken: vi.fn(() => "mock_token"),
}));

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("useAuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not redirect when token exists on mount", () => {
    renderHook(() => useAuthGuard(), { wrapper });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should redirect when user key is removed from localStorage in another tab", async () => {
    const { getAuthToken } = await import("../utils/storage");
    // Mock no token when storage event fires
    getAuthToken.mockReturnValue(null);

    renderHook(() => useAuthGuard(), { wrapper });

    // Simulate another tab clearing the user key
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "user",
        newValue: null,
        oldValue: JSON.stringify({ token: "old_token" }),
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("should not redirect on storage events for unrelated keys", () => {
    renderHook(() => useAuthGuard(), { wrapper });

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "some-other-key",
        newValue: null,
      })
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
