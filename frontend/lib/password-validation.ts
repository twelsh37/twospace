// frontend/lib/password-validation.ts

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

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

/**
 * Validates a password against the specified requirements:
 * 1. At least 12 characters
 * 2. At least one uppercase letter
 * 3. At least one lowercase letter
 * 4. At least one number
 * 5. At least one non-alphanumeric character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const requirements = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@£$%^&*():"|;'\\?><,.//]/.test(password),
  };

  // Check each requirement and add error messages
  if (!requirements.length) {
    errors.push("Password must be at least 12 characters long");
  }
  if (!requirements.uppercase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!requirements.lowercase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!requirements.number) {
    errors.push("Password must contain at least one number");
  }
  if (!requirements.special) {
    errors.push(
      "Password must contain at least one special character (!@£$%^&*():\"|;'\\?><,.//)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
  };
}

/**
 * Generates a password strength indicator (0-4)
 * 0: Invalid, 1: Weak, 2: Fair, 3: Good, 4: Strong
 */
export function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0;

  const validation = validatePassword(password);
  if (!validation.isValid) return 0;

  let strength = 0;

  // Base strength for meeting minimum requirements
  strength += 1;

  // Additional strength for length
  if (password.length >= 16) strength += 1;
  else if (password.length >= 14) strength += 0.5;

  // Additional strength for complexity
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 10) strength += 1;
  else if (uniqueChars >= 8) strength += 0.5;

  // Additional strength for mixed character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@£$%^&*():"|;'\\?><,.//]/.test(password);

  const characterTypes = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;
  if (characterTypes >= 4) strength += 1;
  else if (characterTypes >= 3) strength += 0.5;

  return Math.min(4, Math.floor(strength));
}

/**
 * Returns a human-readable password strength description
 */
export function getPasswordStrengthText(strength: number): string {
  switch (strength) {
    case 0:
      return "Invalid";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "Unknown";
  }
}

/**
 * Returns the color class for password strength indicator
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
      return "bg-red-500";
    case 1:
      return "bg-red-400";
    case 2:
      return "bg-yellow-400";
    case 3:
      return "bg-blue-400";
    case 4:
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
}
