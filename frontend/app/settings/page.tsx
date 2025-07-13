// frontend/app/settings/page.tsx
// Settings page for system-wide configuration (report cache duration, depreciation, tools)

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

  // Fetch current setting on mount (including depreciationSettings)
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.reportCacheDuration) {
          setCacheDuration(json.reportCacheDuration);
          setInitialValue(json.reportCacheDuration);
        } else {
          setError("Failed to load settings");
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
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-8 min-h-[80vh] bg-gray-50">
        {/* Large background card to group all settings */}
        <Card className="w-full max-w-4xl p-0 shadow-2xl border border-gray-300 bg-white">
          <CardHeader className="pt-6">
            <CardTitle className="text-2xl md:text-3xl">Settings</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {/* Responsive 2x2 grid for section cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* --- Reporting Section Card --- */}
              <Card className="shadow-lg border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (isChanged) handleSave();
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-6">
                      <label
                        htmlFor="cacheDuration"
                        className="font-medium text-sm md:text-base"
                      >
                        Report Cache Duration (minutes):
                      </label>
                      <input
                        id="cacheDuration"
                        type="number"
                        min={1}
                        max={1440}
                        value={cacheDuration}
                        onChange={(e) => setCacheDuration(Number(e.target.value))}
                        className="w-full md:w-32 px-3 py-2 md:py-1.5 text-base md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        disabled={saving}
                      />
                    </div>
                    {/* Error and Success Messages */}
                    {error && (
                      <p className="text-red-600 mb-4 text-sm md:text-base">
                        {error}
                      </p>
                    )}
                    {success && (
                      <p className="text-green-600 mb-4 text-sm md:text-base">
                        Settings saved!
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* --- Depreciation Section Card --- */}
              <Card className="shadow-lg border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">
                    Depreciation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 md:gap-5">
                    {/* Depreciation Method Dropdown Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                      <label
                        htmlFor="depreciationMethod"
                        className="font-medium text-sm md:text-base"
                      >
                        Depreciation Method:
                      </label>
                      <select
                        id="depreciationMethod"
                        value={depreciationMethod}
                        onChange={(e) =>
                          setDepreciationMethod(
                            e.target.value as "straight" | "declining"
                          )
                        }
                        className="w-full md:w-48 px-3 py-2 text-base md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="straight">Straight line</option>
                        <option value="declining">Declining balance</option>
                      </select>
                    </div>
                    {/* Straight Line Fields */}
                    {depreciationMethod === "straight" && (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                          <label
                            htmlFor="straightYears"
                            className="font-medium text-sm md:text-base"
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
                            className="w-full md:w-48 px-3 py-2 text-base md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                          />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                          <label
                            htmlFor="straightPercent"
                            className="font-medium text-sm md:text-base"
                          >
                            Percentage per year:
                          </label>
                          <div className="relative w-full md:w-48">
                            <input
                              id="straightPercent"
                              type="number"
                              value={straightLinePercent}
                              readOnly
                              className="w-full px-3 py-2 text-base md:text-sm border border-gray-300 rounded-md bg-gray-50 text-right pr-8"
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
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-2">
                          <label
                            htmlFor="decliningYears"
                            className="font-medium text-sm md:text-base"
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
                            className="w-full md:w-48 px-3 py-2 text-base md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                          />
                        </div>
                        <div className="w-full md:w-48 md:ml-auto">
                          <div className="flex flex-col gap-2 md:gap-3">
                            {Array.from({ length: depreciationYears }).map(
                              (_, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 md:justify-end"
                                >
                                  <label
                                    htmlFor={`decliningYear${idx + 1}`}
                                    className="font-medium text-sm md:text-base md:min-w-[70px] md:text-right"
                                  >
                                    Year {idx + 1}:
                                  </label>
                                  <div className="relative w-full md:w-20">
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
                                      className="w-full px-3 py-2 text-base md:text-sm border border-gray-300 rounded-md bg-gray-50 text-right pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                      %
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                            <div
                              className={`mt-2 md:mt-3 font-medium text-sm md:text-base md:self-end ${
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
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <FaBarcode className="text-lg md:text-xl" /> Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <strong className="text-sm md:text-base">
                      Barcode Scanner Test
                    </strong>
                    <p className="mt-2 text-sm md:text-base text-gray-600">
                      Test your barcode scanner and verify it works with the
                      system. Useful for setup, troubleshooting, and training.
                    </p>
                  </div>
                  <Link href="/barcode-test">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md px-4 md:px-5 py-2 md:py-2.5 font-semibold text-sm md:text-base cursor-pointer flex items-center gap-2 transition-colors duration-200"
                      aria-label="Go to Barcode Test"
                      title="Go to Barcode Test"
                    >
                      <FaBarcode /> Go to Barcode Test
                    </button>
                  </Link>
                </CardContent>
              </Card>

              {/* --- Placeholder for future cards --- */}
              <div className="hidden md:block" />
            </div>

            {/* Save Button - centered below the grid */}
            <div className="w-full flex justify-center mt-8 mb-2">
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
    </ErrorBoundary>
  );
}
