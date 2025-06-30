// frontend/app/settings/page.tsx
// Settings page for system-wide configuration (report cache duration)

"use client";
import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [cacheDuration, setCacheDuration] = useState(30);
  const [initialValue, setInitialValue] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      } catch (err) {
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
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const isChanged = cacheDuration !== initialValue;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{ fontWeight: "bold", fontSize: "2rem", marginBottom: "2rem" }}
      >
        Settings
      </h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isChanged) handleSave();
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <label
              htmlFor="cacheDuration"
              style={{ flex: 1, textAlign: "right", marginRight: 16 }}
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
              style={{ width: 80, padding: 6, fontSize: 16 }}
              disabled={saving}
            />
          </div>
          {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}
          {success && (
            <p style={{ color: "green", marginBottom: 16 }}>Settings saved!</p>
          )}
          <button
            type="submit"
            disabled={!isChanged || saving}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: 18,
              fontWeight: "bold",
              background: isChanged && !saving ? "#2563EB" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: isChanged && !saving ? "pointer" : "not-allowed",
              marginTop: 24,
              transition: "background 0.2s",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
