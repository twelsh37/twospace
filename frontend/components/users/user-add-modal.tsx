"use client";
// frontend/components/users/user-add-modal.tsx
// Add User Modal with card-based theming, validation, and toast notifications

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

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Location } from "@/lib/db/schema";
import { useAuth } from "@/lib/auth-context";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function UserAddModal({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}) {
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  // Fetch locations
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    []
  );
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    departmentId: "",
    locationId: "",
    role: "USER",
    isActive: "true",
    employeeId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth(); // Get session from auth context

  // Fetch departments
  useEffect(() => {
    if (!open) return;
    setDepartmentsLoading(true);
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        // Store array of { id, name }
        if (json.departments && Array.isArray(json.departments)) {
          setDepartments(json.departments);
        } else {
          setDepartments([]);
        }
      } catch {
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    }
    fetchDepartments();
  }, [open]);

  // Fetch next employeeId when modal opens
  useEffect(() => {
    if (!open) return;
    async function fetchNextEmployeeId() {
      try {
        const res = await fetch("/api/users/next-employee-id");
        const json = await res.json();
        if (json.nextEmployeeId) {
          setForm((prev) => ({ ...prev, employeeId: json.nextEmployeeId }));
        }
      } catch {
        setForm((prev) => ({ ...prev, employeeId: "EMP000001" }));
      }
    }
    fetchNextEmployeeId();
  }, [open]);

  // Fetch locations
  useEffect(() => {
    if (!open) return;
    setLocationsLoading(true);
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations?limit=1000");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLocations(
            // Use the Location type instead of any for type safety
            json.data.map((loc: Location) => ({ id: loc.id, name: loc.name }))
          );
        } else {
          setLocations([]);
        }
      } catch {
        setLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    }
    fetchLocations();
  }, [open]);

  // Field validation
  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return "Valid email is required.";
    if (!form.departmentId) return "Department is required.";
    if (!form.locationId) return "Location is required.";
    if (!form.role) return "Role is required.";
    if (!form.employeeId.trim()) return "Employee ID is required.";
    return null;
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      showErrorToast(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Attach Authorization header if access token is available
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const res = await fetch("/api/users", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          departmentId: form.departmentId,
          locationId: form.locationId, // send locationId
          role: form.role,
          isActive: form.isActive === "true",
          employeeId: form.employeeId,
        }),
      });
      if (!res.ok) {
        // Try to extract error message from backend
        let errorMsg = "Failed to add user.";
        try {
          const errorJson = await res.json();
          if (errorJson && errorJson.error) {
            errorMsg = errorJson.error;
          }
        } catch {}
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }
      showSuccessToast("User added successfully!");
      setForm({
        name: "",
        email: "",
        departmentId: "",
        locationId: "",
        role: "USER",
        isActive: "true",
        employeeId: "",
      });
      if (onAdded) onAdded();
      onOpenChange(false);
    } catch (err) {
      // Show error from fetch (network or unexpected)
      setError(err instanceof Error ? err.message : "Failed to add user.");
      showErrorToast(
        err instanceof Error ? err.message : "Failed to add user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: "",
      email: "",
      departmentId: "",
      locationId: "",
      role: "USER",
      isActive: "true",
      employeeId: "",
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" hideClose={true}>
        {/* Visually hidden DialogTitle for accessibility */}
        <DialogTitle asChild>
          <VisuallyHidden>Add User</VisuallyHidden>
        </DialogTitle>
        <Card className="shadow-lg border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle>Add User</CardTitle>
            <CardDescription>
              Fill in the details to add a new user.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form
              id="add-user-form"
              className="space-y-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  autoFocus
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department
                </label>
                {departmentsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading departments...
                  </div>
                ) : (
                  <Select
                    value={form.departmentId}
                    onValueChange={(value) =>
                      handleChange("departmentId", value)
                    }
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                {locationsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading locations...
                  </div>
                ) : (
                  <Select
                    value={form.locationId}
                    onValueChange={(value) => handleChange("locationId", value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select
                  value={form.role}
                  onValueChange={(value) => handleChange("role", value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Active</label>
                <Select
                  value={form.isActive}
                  onValueChange={(value) => handleChange("isActive", value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee ID
                </label>
                {/* Made Employee ID editable by removing disabled and readOnly */}
                <Input
                  value={form.employeeId}
                  onChange={(e) => handleChange("employeeId", e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-user-form"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "Adding..." : "Add User"}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
