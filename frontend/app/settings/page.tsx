// frontend/app/settings/page.tsx
// Settings page for system-wide configuration (report cache duration)

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBarcode } from "react-icons/fa";

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

  return (
    // Main container for the settings page - mobile-first responsive design
    <div className="relative p-4 md:p-8 min-h-[80vh] max-w-full md:max-w-2xl mx-auto">
      {/* Settings Page Heading */}
      <h1 className="font-bold text-2xl md:text-3xl mb-6 md:mb-8 text-left">
        Settings
      </h1>

      {loading ? (
        <p className="text-center py-8">Loading...</p>
      ) : (
        // Reporting section card - mobile-first with responsive spacing
        <div className="border border-gray-200 rounded-lg p-4 md:p-6 max-w-full md:max-w-lg bg-white shadow-sm mb-6 md:mb-8">
          {/* Section Title */}
          <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6 text-left tracking-wide">
            Reporting
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isChanged) handleSave();
            }}
          >
            {/* Settings Form Row - mobile stacked, desktop side-by-side */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-6 md:mb-8">
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
              <p className="text-red-600 mb-4 text-sm md:text-base">{error}</p>
            )}
            {success && (
              <p className="text-green-600 mb-4 text-sm md:text-base">
                Settings saved!
              </p>
            )}
          </form>
        </div>
      )}

      {/* --- Depreciation Settings Card --- */}
      <div className="border border-gray-200 rounded-lg p-4 md:p-6 max-w-full md:max-w-lg bg-white shadow-sm mb-6 md:mb-8">
        {/* Section Title */}
        <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6 text-left tracking-wide">
          Depreciation
        </h2>

        {/* Depreciation Method and Fields - mobile stacked, desktop side-by-side */}
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
              {/* Years input row */}
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

              {/* Percentage per year row */}
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
              {/* Years input row for Declining Balance */}
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

              {/* Dynamic percentage inputs per year - mobile stacked, desktop right-aligned */}
              <div className="w-full md:w-48 md:ml-auto">
                <div className="flex flex-col gap-2 md:gap-3">
                  {Array.from({ length: depreciationYears }).map((_, idx) => (
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
                  ))}

                  {/* Total and warning */}
                  <div
                    className={`mt-2 md:mt-3 font-medium text-sm md:text-base md:self-end ${
                      decliningWarning ? "text-red-600" : "text-green-600"
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
      </div>

      {/* --- Tools Section --- */}
      <div className="border border-gray-200 rounded-lg p-4 md:p-6 max-w-full md:max-w-lg bg-white shadow-sm mb-6 md:mb-8">
        <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6 text-left tracking-wide flex items-center gap-2">
          <FaBarcode className="text-lg md:text-xl" /> Tools
        </h2>

        <div className="mb-4">
          <strong className="text-sm md:text-base">Barcode Scanner Test</strong>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Test your barcode scanner and verify it works with the system.
            Useful for setup, troubleshooting, and training.
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
      </div>

      {/* Save Button - mobile bottom center, desktop bottom right */}
      <div className="fixed md:absolute bottom-4 md:bottom-8 left-1/2 md:left-auto md:right-8 transform -translate-x-1/2 md:transform-none z-10">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isChanged || saving}
          className={`min-w-[100px] px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base font-bold text-white border-none rounded-md cursor-pointer transition-all duration-200 text-center shadow-lg ${
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
    </div>
  );
}
