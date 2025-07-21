// frontend/components/users/user-edit-modal.tsx

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

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface UserEditModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  employeeId: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

export function UserEditModal({
  userId,
  open,
  onOpenChange,
  onUpdated,
}: UserEditModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // Fetch user data when modal opens
  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    setError(null);
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const json = await res.json();
        setUser(json.data || null);
        setForm(json.data || {});
      } catch {
        setUser(null);
        setForm({});
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId, open]);

  // Fetch departments when modal opens
  useEffect(() => {
    if (!open) return;
    setDepartmentsLoading(true);
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
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

  // Track if form is dirty
  const isDirty =
    user &&
    Object.keys(form).some(
      (key) =>
        (form as Record<string, unknown>)[key] !==
        (user as unknown as Record<string, unknown>)[key]
    );

  const handleChange = (key: keyof User, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !isDirty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update user");
      if (onUpdated) onUpdated();
      onOpenChange(false);
    } catch {
      setError("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" hideClose={true}>
        {/* Visually hidden DialogTitle for accessibility */}
        <DialogTitle asChild>
          <VisuallyHidden>Edit User</VisuallyHidden>
        </DialogTitle>
        <Card className="shadow-lg border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              Update user details. Only fields from the UserTable are editable.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : user ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={form.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
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
                      value={form.department || ""}
                      onValueChange={(value) =>
                        handleChange("department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Select
                    value={form.role || "USER"}
                    onValueChange={(value) => handleChange("role", value)}
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
                  <label className="block text-sm font-medium mb-1">
                    Active
                  </label>
                  <Select
                    value={form.isActive ? "true" : "false"}
                    onValueChange={(value) =>
                      handleChange("isActive", value === "true")
                    }
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employee ID
                  </label>
                  <Input
                    value={form.employeeId || ""}
                    onChange={(e) => handleChange("employeeId", e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {/* Action buttons in CardFooter */}
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOpenChange(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isDirty || saving}>
                    {saving ? "Updating..." : "Update"}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <div className="p-8 text-center text-red-500">
                User not found.
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
