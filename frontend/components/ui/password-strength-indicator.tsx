// frontend/components/ui/password-strength-indicator.tsx

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

"use client";

import React from "react";
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  type PasswordValidationResult,
} from "@/lib/password-validation";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  className = "",
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);
  const strength = getPasswordStrength(password);
  const strengthText = getPasswordStrengthText(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength / 4) * 100}%` }}
          />
        </div>
        <span
          className={`text-sm font-medium ${
            strength === 0
              ? "text-red-600"
              : strength === 1
              ? "text-red-500"
              : strength === 2
              ? "text-yellow-600"
              : strength === 3
              ? "text-blue-600"
              : "text-green-600"
          }`}
        >
          {strengthText}
        </span>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-1">
            Password Requirements:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
            <RequirementItem
              met={validation.requirements.length}
              text="At least 12 characters"
            />
            <RequirementItem
              met={validation.requirements.uppercase}
              text="One uppercase letter"
            />
            <RequirementItem
              met={validation.requirements.lowercase}
              text="One lowercase letter"
            />
            <RequirementItem
              met={validation.requirements.number}
              text="One number"
            />
            <RequirementItem
              met={validation.requirements.special}
              text="One special character"
            />
          </div>
        </div>
      )}

      {/* Error Messages */}
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="text-xs text-red-600 flex items-center">
              <span className="mr-1">•</span>
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center space-x-1">
      <div
        className={`w-3 h-3 rounded-full flex items-center justify-center ${
          met ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        {met && (
          <svg
            className="w-2 h-2 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span className={`text-xs ${met ? "text-green-700" : "text-gray-500"}`}>
        {text}
      </span>
    </div>
  );
}
