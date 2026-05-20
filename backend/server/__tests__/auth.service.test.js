/**
 * @file auth.service.test.js
 * Tests for the authentication service layer.
 *
 * NOTE: These are unit tests using mocked MongoDB models.
 * For integration tests with a real DB, use a separate test DB + beforeAll setup.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock modules before importing the service ─────────────────────────────────
vi.mock("../models/User.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async (pw) => `hashed_${pw}`),
    compare: vi.fn(async (plain, hashed) => plain === hashed.replace("hashed_", "")),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mock_jwt_token"),
    verify: vi.fn(() => ({ _id: "user_id", email: "test@test.com" })),
  },
}));

vi.mock("../config/env.js", () => ({
  default: {
    jwtSecret: "test_secret",
    jwtExpiresIn: "1h",
  },
}));

import User from "../models/User.model.js";
import { registerUser, loginUser } from "../services/auth.service.js";

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── registerUser ────────────────────────────────────────────────────────────
  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      User.findOne.mockResolvedValue(null); // no existing user
      User.create.mockResolvedValue({ _id: "new_id", email: "new@test.com" });

      const result = await registerUser({
        name: "Test User",
        email: "new@test.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.message).toMatch(/signup/i);
      expect(User.create).toHaveBeenCalledOnce();
    });

    it("should throw if user already exists", async () => {
      User.findOne.mockResolvedValue({ email: "exists@test.com" }); // existing user

      await expect(
        registerUser({ name: "Dup", email: "exists@test.com", password: "pw" })
      ).rejects.toThrow(/already exists/i);

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  // ── loginUser ───────────────────────────────────────────────────────────────
  describe("loginUser", () => {
    it("should login successfully with correct credentials", async () => {
      User.findOne.mockResolvedValue({
        _id: "user_id",
        email: "user@test.com",
        name: "Test User",
        // bcrypt hashes start with "$2" — auth service checks this to decide compare vs plain
        password: "$2b$10$hashedpassword",
        save: vi.fn(),
      });

      // bcrypt.compare is mocked — make it return true for this test
      const bcrypt = await import("bcrypt");
      bcrypt.default.compare.mockResolvedValueOnce(true);

      const result = await loginUser({ email: "user@test.com", password: "secret123" });

      expect(result.success).toBe(true);
      expect(result.token).toBe("mock_jwt_token");
      expect(result.email).toBe("user@test.com");
    });

    it("should throw on wrong password", async () => {
      User.findOne.mockResolvedValue({
        _id: "user_id",
        email: "user@test.com",
        password: "hashed_correctpassword",
        save: vi.fn(),
      });

      await expect(
        loginUser({ email: "user@test.com", password: "wrongpassword" })
      ).rejects.toThrow(/email or password/i);
    });

    it("should throw when user does not exist", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        loginUser({ email: "noone@test.com", password: "any" })
      ).rejects.toThrow(/email or password/i);
    });
  });
});
