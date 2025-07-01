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

  // Fetch current setting on mount
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
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Save handler
  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportCacheDuration: cacheDuration }),
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
    // Main container for the settings page
    <div
      style={{
        position: "relative",
        padding: "2rem",
        minHeight: "80vh",
        maxWidth: 700,
      }}
    >
      {/* Settings Page Heading */}
      <h1
        style={{
          fontWeight: "bold",
          fontSize: "2rem",
          marginBottom: "2rem",
          textAlign: "left",
        }}
      >
        Settings
      </h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        // Reporting section card
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "1.5rem",
            maxWidth: 500,
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            marginBottom: 32,
          }}
        >
          {/* Section Title */}
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
              textAlign: "left",
              letterSpacing: 0.5,
            }}
          >
            Reporting
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isChanged) handleSave();
            }}
          >
            {/* Settings Form Row - label left, value right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <label
                htmlFor="cacheDuration"
                style={{ fontWeight: 500, textAlign: "left" }}
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
                style={{ width: 120, padding: 6, fontSize: 16, marginLeft: 16 }}
                disabled={saving}
              />
            </div>
            {/* Error and Success Messages */}
            {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}
            {success && (
              <p style={{ color: "green", marginBottom: 16 }}>
                Settings saved!
              </p>
            )}
          </form>
        </div>
      )}
      {/* --- Depreciation Settings Card --- */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "1.5rem",
          maxWidth: 500,
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          marginBottom: 32,
        }}
      >
        {/* Section Title */}
        <h2
          style={{
            fontWeight: "bold",
            fontSize: "1.2rem",
            marginBottom: "1.5rem",
            textAlign: "left",
            letterSpacing: 0.5,
          }}
        >
          Depreciation
        </h2>
        {/* Depreciation Method and Fields - right-aligned inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Depreciation Method Dropdown Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <label htmlFor="depreciationMethod" style={{ fontWeight: 500 }}>
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
              style={{
                padding: "6px 12px",
                fontSize: 16,
                borderRadius: 6,
                border: "1px solid #ccc",
                width: 200,
                textAlign: "left",
                paddingLeft: "1rem",
              }}
            >
              <option
                value="straight"
                style={{ textAlign: "left", paddingLeft: "1rem" }}
              >
                Straight line
              </option>
              <option
                value="declining"
                style={{ textAlign: "left", paddingLeft: "1rem" }}
              >
                Declining balance
              </option>
            </select>
          </div>
          {/* Straight Line Fields */}
          {depreciationMethod === "straight" && (
            <>
              {/* Years input row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <label htmlFor="straightYears" style={{ fontWeight: 500 }}>
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
                  style={{
                    width: 200,
                    padding: 6,
                    fontSize: 16,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    textAlign: "right",
                  }}
                />
              </div>
              {/* Percentage per year row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <label htmlFor="straightPercent" style={{ fontWeight: 500 }}>
                  Percentage per year:
                </label>
                <div style={{ position: "relative", width: 200 }}>
                  <input
                    id="straightPercent"
                    type="number"
                    value={straightLinePercent}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "6px 28px 6px 6px",
                      fontSize: 16,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "#f3f4f6",
                      textAlign: "right",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#888",
                      fontSize: 15,
                    }}
                  >
                    %
                  </span>
                </div>
              </div>
            </>
          )}
          {/* Declining Balance Fields */}
          {depreciationMethod === "declining" && (
            <>
              {/* Years input row for Declining Balance - right aligned with dropdown */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: 8,
                }}
              >
                <label htmlFor="decliningYears" style={{ fontWeight: 500 }}>
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
                  style={{
                    width: 200,
                    padding: 6,
                    fontSize: 16,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    textAlign: "right",
                  }}
                />
              </div>
              {/* Dynamic percentage inputs per year - right aligned under Years input */}
              <div
                style={{
                  width: 200,
                  marginLeft: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                {Array.from({ length: depreciationYears }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 500,
                        minWidth: 70,
                        textAlign: "right",
                      }}
                    >
                      Year {idx + 1}:
                    </label>
                    <div style={{ position: "relative", width: 80 }}>
                      <input
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
                        style={{
                          width: "100%",
                          padding: "6px 28px 6px 6px",
                          fontSize: 16,
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          textAlign: "right",
                          background: "#f3f4f6",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#888",
                          fontSize: 15,
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                ))}
                {/* Total and warning - right aligned with input boxes */}
                <div
                  style={{
                    marginTop: 8,
                    color: decliningWarning ? "red" : "#16a34a",
                    fontWeight: 500,
                    alignSelf: "flex-end",
                  }}
                >
                  Total: {decliningTotal.toFixed(2)}%{" "}
                  {decliningWarning && "(Should total 100%)"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Tools Section --- */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "1.5rem",
          maxWidth: 500,
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            fontSize: "1.2rem",
            marginBottom: "1.5rem",
            textAlign: "left",
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FaBarcode style={{ marginRight: 8 }} /> Tools
        </h2>
        <div style={{ marginBottom: 16 }}>
          <strong>Barcode Scanner Test</strong>
          <p style={{ margin: "8px 0 0 0", color: "#555" }}>
            Test your barcode scanner and verify it works with the system.
            Useful for setup, troubleshooting, and training.
          </p>
        </div>
        <Link href="/barcode-test">
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaBarcode /> Go to Barcode Test
          </button>
        </Link>
      </div>

      {/* Save Button - absolutely positioned bottom right of the container */}
      <div style={{ position: "absolute", right: 32, bottom: 32 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isChanged || saving}
          style={{
            minWidth: 100,
            padding: "0.5rem 1.2rem",
            fontSize: 15,
            fontWeight: "bold",
            background: isChanged && !saving ? "#2563EB" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: isChanged && !saving ? "pointer" : "not-allowed",
            transition: "background 0.2s",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
