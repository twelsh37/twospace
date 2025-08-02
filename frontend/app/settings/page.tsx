// frontend/app/settings/page.tsx
// Application settings page

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBarcode } from "react-icons/fa";
// Import Card UI components for consistent layout
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  // CardFooter, // Remove unused import
} from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@/lib/supabase";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";

export default function SettingsPage() {
  const [cacheDuration, setCacheDuration] = useState(30);
  const [initialValue, setInitialValue] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Depreciation Settings State ---
  const [depreciationMethod, setDepreciationMethod] = useState<
    "straight" | "declining"
  >("straight");
  const [depreciationYears, setDepreciationYears] = useState(4);
  const [decliningPercents, setDecliningPercents] = useState<number[]>([
    50, 25, 12.5, 12.5,
  ]);

  // User password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Ref for focusing the first password input
  const newPasswordRef = React.useRef<HTMLInputElement>(null);

  // Calculate straight line percentage
  const straightLinePercent =
    depreciationYears > 0 ? +(100 / depreciationYears).toFixed(2) : 0;

  // Handle years change for declining balance
  function handleDecliningYearsChange(years: number) {
    setDepreciationYears(years);
    // Adjust the array to match the number of years
    if (years > decliningPercents.length) {
      setDecliningPercents([
        ...decliningPercents,
        ...Array(years - decliningPercents.length).fill(0),
      ]);
    } else {
      setDecliningPercents(decliningPercents.slice(0, years));
    }
  }

  // Handle percentage change for a specific year
  function handleDecliningPercentChange(idx: number, value: number) {
    const updated = [...decliningPercents];
    updated[idx] = value;
    setDecliningPercents(updated);
  }

  // Calculate total for validation
  const decliningTotal = decliningPercents.reduce((a, b) => a + b, 0);
  const decliningWarning = Math.abs(decliningTotal - 100) > 0.01;

  // Handler for password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    // Validate passwords match before submitting
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordLoading(false);
      // Focus the first password input for user correction
      if (newPasswordRef.current) {
        newPasswordRef.current.focus();
      }
      return;
    }

    // Validate password requirements
    const { validatePassword } = await import("@/lib/password-validation");
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(
        "Password does not meet requirements. Please check the requirements below."
      );
      setPasswordLoading(false);
      return;
    }

    try {
      const supabase = createClientComponentClient();
      // Supabase only requires new password, but you may want to verify current password client-side
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setPasswordError(error.message || "Failed to change password.");
      } else {
        setPasswordSuccess("Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Fetch current setting on mount (including depreciationSettings)
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setError(null);
      try {
        // Get the current session for authentication
        const supabase = createClientComponentClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError("Not authenticated");
          return;
        }

        const res = await fetch("/api/settings", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          // If settings don't exist, use default values
          if (res.status === 404) {
            setCacheDuration(30);
            setInitialValue(30);
            setDepreciationMethod("straight");
            setDepreciationYears(4);
            setDecliningPercents([50, 25, 12.5, 12.5]);
            return;
          }
          // For other errors, show the error message
          const errorData = await res.json();
          setError(errorData.error || "Failed to load settings");
          return;
        }

        const json = await res.json();
        if (json.reportCacheDuration) {
          setCacheDuration(json.reportCacheDuration);
          setInitialValue(json.reportCacheDuration);
        } else {
          // Use default values if reportCacheDuration is not present
          setCacheDuration(30);
          setInitialValue(30);
        }
        // Load depreciation settings if present
        if (json.depreciationSettings) {
          setDepreciationMethod(json.depreciationSettings.method || "straight");
          setDepreciationYears(json.depreciationSettings.years || 4);
          setDecliningPercents(
            Array.isArray(json.depreciationSettings.decliningPercents)
              ? json.depreciationSettings.decliningPercents
              : [50, 25, 12.5, 12.5]
          );
        }
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Save handler (save both cacheDuration and depreciationSettings)
  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Get the current session for authentication
      const supabase = createClientComponentClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reportCacheDuration: cacheDuration,
          depreciationSettings: {
            method: depreciationMethod,
            years: depreciationYears,
            decliningPercents,
          },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setInitialValue(json.reportCacheDuration);
        setSuccess(true);
      } else {
        setError(json.error || "Failed to save settings");
      }
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const isChanged = cacheDuration !== initialValue;

  if (loading) {
    // Show loading message while fetching settings
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <div className="w-full max-w-4xl">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Layout Refactor Start ---
  // The entire page is now wrapped in a background Card for consistency
  return (
    <ErrorBoundary>
      {/* The main settings card is left-aligned with 8px (p-2) horizontal padding */}
      {/* Top padding reduced to py-4 for less space above the card */}
      <div className="flex-1 flex flex-col min-h-[80vh] bg-gray-50 py-4 px-2 md:px-0">
        <div className="w-full max-w-7xl p-8">
          {/* Main background card for the whole settings page, left-aligned with 32px (p-8) padding */}
          <Card className="w-full shadow-2xl border border-gray-300 bg-white p-0">
            <CardHeader className="pt-6 pb-2">
              <CardTitle className="text-2xl md:text-3xl">Settings</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              {/* First row: 4 widgets per row (Reporting, Depreciation, Tools, Reset Password) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* --- Reporting Section Card --- */}
                <Card className="shadow-lg border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Reporting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isChanged) handleSave();
                      }}
                    >
                      <div className="flex flex-col gap-3 mb-6">
                        <label
                          htmlFor="cacheDuration"
                          className="font-medium text-sm"
                        >
                          Report Cache Duration (minutes):
                        </label>
                        <input
                          id="cacheDuration"
                          type="number"
                          min={1}
                          max={1440}
                          value={cacheDuration}
                          onChange={(e) =>
                            setCacheDuration(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                          disabled={saving}
                        />
                      </div>
                      {/* Error and Success Messages */}
                      {error && (
                        <p className="text-red-600 mb-4 text-sm">{error}</p>
                      )}
                      {success && (
                        <p className="text-green-600 mb-4 text-sm">
                          Settings saved!
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* --- Depreciation Section Card --- */}
                <Card className="shadow-lg border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Depreciation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {/* Depreciation Method Dropdown Row */}
                      <div className="flex flex-col gap-3">
                        <label
                          htmlFor="depreciationMethod"
                          className="font-medium text-sm"
                        >
                          Method:
                        </label>
                        <select
                          id="depreciationMethod"
                          value={depreciationMethod}
                          onChange={(e) =>
                            setDepreciationMethod(
                              e.target.value as "straight" | "declining"
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="straight">Straight line</option>
                          <option value="declining">Declining balance</option>
                        </select>
                      </div>
                      {/* Straight Line Fields */}
                      {depreciationMethod === "straight" && (
                        <>
                          <div className="flex flex-col gap-3">
                            <label
                              htmlFor="straightYears"
                              className="font-medium text-sm"
                            >
                              Years:
                            </label>
                            <input
                              id="straightYears"
                              type="number"
                              min={1}
                              max={4}
                              value={depreciationYears}
                              onChange={(e) => {
                                const val = Math.max(
                                  1,
                                  Math.min(4, Number(e.target.value))
                                );
                                setDepreciationYears(val);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <label
                              htmlFor="straightPercent"
                              className="font-medium text-sm"
                            >
                              Percentage per year:
                            </label>
                            <div className="relative w-full">
                              <input
                                id="straightPercent"
                                type="number"
                                value={straightLinePercent}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-right pr-8"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                %
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Declining Balance Fields */}
                      {depreciationMethod === "declining" && (
                        <>
                          <div className="flex flex-col gap-3 mb-2">
                            <label
                              htmlFor="decliningYears"
                              className="font-medium text-sm"
                            >
                              Years:
                            </label>
                            <input
                              id="decliningYears"
                              type="number"
                              min={1}
                              max={4}
                              value={depreciationYears}
                              onChange={(e) => {
                                const val = Math.max(
                                  1,
                                  Math.min(4, Number(e.target.value))
                                );
                                handleDecliningYearsChange(val);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                            />
                          </div>
                          <div className="w-full">
                            <div className="flex flex-col gap-2">
                              {Array.from({ length: depreciationYears }).map(
                                (_, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col gap-2"
                                  >
                                    <label
                                      htmlFor={`decliningYear${idx + 1}`}
                                      className="font-medium text-sm"
                                    >
                                      Year {idx + 1}:
                                    </label>
                                    <div className="relative w-full">
                                      <input
                                        id={`decliningYear${idx + 1}`}
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={decliningPercents[idx] || 0}
                                        onChange={(e) =>
                                          handleDecliningPercentChange(
                                            idx,
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-right pr-8"
                                      />
                                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        %
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                              <div
                                className={`mt-2 font-medium text-sm ${
                                  decliningWarning
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                Total: {decliningTotal.toFixed(2)}%{" "}
                                {decliningWarning && "(Should total 100%)"}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* --- Tools Section Card --- */}
                <Card className="shadow-lg border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <FaBarcode className="text-base md:text-lg" /> Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="mb-4">
                        <strong className="text-sm">
                          Barcode Scanner Test
                        </strong>
                        <p className="mt-2 text-sm text-gray-600">
                          Test your barcode scanner and verify it works with the
                          system. Useful for setup, troubleshooting, and
                          training.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Link href="/barcode-test">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md px-4 py-2 font-semibold text-sm cursor-pointer flex items-center gap-2 transition-colors duration-200"
                          aria-label="Go to Barcode Test"
                          title="Go to Barcode Test"
                        >
                          <FaBarcode /> Go to Barcode Test
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* --- Reset Password Section Card --- */}
                <Card className="shadow-lg border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      Reset Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <form
                      className="flex flex-col h-full"
                      onSubmit={handlePasswordChange}
                    >
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            New Password
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength={12}
                            required
                            placeholder="Enter new password"
                            disabled={passwordLoading}
                            ref={newPasswordRef}
                          />
                          {/* Password Strength Indicator */}
                          {newPassword && (
                            <PasswordStrengthIndicator password={newPassword} />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Confirm New Password
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={12}
                            required
                            placeholder="Re-enter new password"
                            disabled={passwordLoading}
                          />
                        </div>
                        {/* Show error if passwords do not match or other error occurs */}
                        {passwordError && (
                          <div className="text-red-600 text-sm">
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="text-green-600 text-sm">
                            {passwordSuccess}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          type="submit"
                          disabled={
                            passwordLoading ||
                            newPassword.length < 12 ||
                            confirmPassword.length < 12
                          }
                        >
                          {passwordLoading ? "Updating..." : "Change Password"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Second row: Save button, right-aligned with the last card */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isChanged || saving}
                  className={`min-w-[120px] px-6 py-2.5 text-base font-bold text-white border-none rounded-md cursor-pointer transition-all duration-200 text-center shadow-lg ${
                    isChanged && !saving
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Save settings"
                  title="Save settings"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
  // --- Layout Refactor End ---
}
