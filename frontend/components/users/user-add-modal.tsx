// frontend/components/users/user-add-modal.tsx
// Add User Modal with card-based theming, validation, and toast notifications

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

// Simple toast utility (if not found in codebase)
function showToast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "24px";
  toast.style.right = "24px";
  toast.style.zIndex = "9999";
  toast.style.padding = "12px 24px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "bold";
  toast.style.background = type === "success" ? "#22c55e" : "#ef4444";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 400);
  }, 2200);
}

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
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "USER",
    isActive: "true",
    employeeId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments
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

  // Field validation
  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return "Valid email is required.";
    if (!form.department) return "Department is required.";
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
      showToast({ message: validationError, type: "error" });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isActive: form.isActive === "true",
        }),
      });
      if (!res.ok) throw new Error("Failed to add user");
      showToast({ message: "User added successfully!", type: "success" });
      setForm({
        name: "",
        email: "",
        department: "",
        role: "USER",
        isActive: "true",
        employeeId: "",
      });
      if (onAdded) onAdded();
      onOpenChange(false);
    } catch {
      setError("Failed to add user.");
      showToast({ message: "Failed to add user.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: "",
      email: "",
      department: "",
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
                    value={form.department}
                    onValueChange={(value) => handleChange("department", value)}
                    disabled={saving}
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
                <Input value={form.employeeId} disabled readOnly required />
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
