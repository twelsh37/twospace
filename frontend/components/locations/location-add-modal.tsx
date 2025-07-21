// frontend/components/locations/location-add-modal.tsx

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

// Modal for adding a new location

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface LocationAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}

export function LocationAddModal({
  open,
  onOpenChange,
  onAdded,
}: LocationAddModalProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: "true",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth(); // Get session from auth context

  const isValid =
    form.name.trim() &&
    form.description.trim() &&
    (form.isActive === "true" || form.isActive === "false");

  // Add validation error messages
  const getValidationError = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.description.trim()) return "Description is required.";
    if (
      !form.isActive ||
      (form.isActive !== "true" && form.isActive !== "false")
    ) {
      return "Please select a status.";
    }
    return null;
  };

  const handleChange = (
    key: "name" | "description" | "isActive",
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check validation first
    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      showErrorToast(validationError);
      return;
    }

    // Check if user is authenticated
    if (!session?.access_token) {
      setError("You must be logged in to add a location.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Get access token from auth context
      const accessToken = session.access_token;

      console.log("Location Add - Session:", session ? "Present" : "Missing");
      console.log(
        "Location Add - Access Token:",
        accessToken ? "Present" : "Missing"
      );

      const res = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          isActive: form.isActive === "true",
        }),
      });

      console.log("Location Add - Response status:", res.status);

      if (!res.ok) {
        // Try to extract error message from response
        let errorMsg = "Failed to add location.";
        try {
          const errorJson = await res.json();
          if (errorJson && errorJson.error) {
            errorMsg = errorJson.error;
          }
        } catch {}
        throw new Error(errorMsg);
      }

      const result = await res.json();
      console.log("Location Add - Success:", result);

      // Show success toast
      showSuccessToast("Location added successfully!");

      if (onAdded) onAdded();
      onOpenChange(false);
      setForm({ name: "", description: "", isActive: "" });
    } catch (err) {
      console.error("Location Add - Error:", err);
      setError(err instanceof Error ? err.message : "Failed to add location.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      setForm({ name: "", description: "", isActive: "true" });
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
          <DialogDescription>
            Enter details for the new location.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={form.isActive}
              onValueChange={(value) => handleChange("isActive", value)}
              required
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
