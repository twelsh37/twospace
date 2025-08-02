// frontend/lib/password-validation.test.ts

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
} from "./password-validation";

describe("Password Validation", () => {
  describe("validatePassword", () => {
    it("should validate a strong password correctly", () => {
      const result = validatePassword("StrongPass123!");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.requirements).toEqual({
        length: true,
        uppercase: true,
        lowercase: true,
        number: true,
        special: true,
      });
    });

    it("should reject password that is too short", () => {
      const result = validatePassword("Short1!");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
      expect(result.requirements.length).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const result = validatePassword("lowercase123!");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.requirements.uppercase).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const result = validatePassword("UPPERCASE123!");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
      expect(result.requirements.lowercase).toBe(false);
    });

    it("should reject password without numbers", () => {
      const result = validatePassword("NoNumbers!");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
      expect(result.requirements.number).toBe(false);
    });

    it("should reject password without special characters", () => {
      const result = validatePassword("NoSpecial123");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one special character (!@£$%^&*():\"|;'\\?><,.//)"
      );
      expect(result.requirements.special).toBe(false);
    });

    it("should return multiple errors for invalid password", () => {
      const result = validatePassword("weak");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.errors).toContain(
        "Password must be at least 12 characters long"
      );
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
      expect(result.errors).toContain(
        "Password must contain at least one special character (!@£$%^&*():\"|;'\\?><,.//)"
      );
    });

    it("should accept various special characters", () => {
      const specialChars = "!@£$%^&*():\"|;'\\?><,.//";

      specialChars.split("").forEach((char) => {
        const password = `TestPass123${char}`;
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.requirements.special).toBe(true);
      });
    });
  });

  describe("getPasswordStrength", () => {
    it("should return 0 for empty password", () => {
      expect(getPasswordStrength("")).toBe(0);
    });

    it("should return 0 for invalid password", () => {
      expect(getPasswordStrength("weak")).toBe(0);
    });

    it("should return 1 for minimum valid password", () => {
      expect(getPasswordStrength("ValidPass123!")).toBe(1);
    });

    it("should return higher strength for longer passwords", () => {
      expect(getPasswordStrength("VeryLongPassword123!")).toBeGreaterThan(1);
    });

    it("should return higher strength for complex passwords", () => {
      expect(getPasswordStrength("Complex!@#$%^&*()123")).toBeGreaterThan(1);
    });
  });

  describe("getPasswordStrengthText", () => {
    it("should return correct text for each strength level", () => {
      expect(getPasswordStrengthText(0)).toBe("Invalid");
      expect(getPasswordStrengthText(1)).toBe("Weak");
      expect(getPasswordStrengthText(2)).toBe("Fair");
      expect(getPasswordStrengthText(3)).toBe("Good");
      expect(getPasswordStrengthText(4)).toBe("Strong");
    });

    it("should return Unknown for invalid strength", () => {
      expect(getPasswordStrengthText(5)).toBe("Unknown");
      expect(getPasswordStrengthText(-1)).toBe("Unknown");
    });
  });

  describe("getPasswordStrengthColor", () => {
    it("should return correct color classes", () => {
      expect(getPasswordStrengthColor(0)).toBe("bg-red-500");
      expect(getPasswordStrengthColor(1)).toBe("bg-red-400");
      expect(getPasswordStrengthColor(2)).toBe("bg-yellow-400");
      expect(getPasswordStrengthColor(3)).toBe("bg-blue-400");
      expect(getPasswordStrengthColor(4)).toBe("bg-green-500");
    });

    it("should return gray for invalid strength", () => {
      expect(getPasswordStrengthColor(5)).toBe("bg-gray-300");
      expect(getPasswordStrengthColor(-1)).toBe("bg-gray-300");
    });
  });
});
