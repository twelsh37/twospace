"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { UserDetailModal } from "./user-detail-modal";
import { UserEditModal } from "./user-edit-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define a type for the filters prop that expects string values
export interface UserTableFilters {
  department: string;
  role: string;
}

interface UserTableProps {
  filters: UserTableFilters;
  page: number;
  onPageChange: (pageNumber: number) => void;
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

export function UserTable({ filters, page, onPageChange }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        // Debug log to see what is being sent for filters
        console.log("UserTable API call filters:", filters);
        if (filters.department && filters.department !== "all") {
          params.set("department", filters.department);
        }
        if (filters.role && filters.role !== "all") {
          params.set("role", filters.role);
        }
        params.set("page", page.toString());
        params.set("limit", "10");
        const response = await fetch(`/api/users?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const result = await response.json();
        setUsers(result.data || []);
        setPagination(result.pagination || null);
      } catch {
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [filters, page]);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  const handleEditClick = (userId: string) => {
    setEditUserId(userId);
    setEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    setEditModalOpen(false);
    setUsers([]);
    setTimeout(() => {
      onPageChange(page);
      if (
        typeof window !== "undefined" &&
        (window as Window & { mutateDashboard?: () => void }).mutateDashboard
      ) {
        (window as Window & { mutateDashboard?: () => void })
          .mutateDashboard!();
      }
    }, 100);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      await fetch(`/api/users/${deleteUserId}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setDeleteUserId(null);
      setUsers([]);
      setTimeout(() => {
        onPageChange(page);
        if (
          typeof window !== "undefined" &&
          (window as Window & { mutateDashboard?: () => void }).mutateDashboard
        ) {
          (window as Window & { mutateDashboard?: () => void })
            .mutateDashboard!();
        }
      }, 100);
    } catch {
      setDeleting(false);
    }
    setDeleting(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  if (!users.length) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <UserDetailModal
        userId={selectedUserId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
      <UserEditModal
        userId={editUserId}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={handleUserUpdated}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirmed}
        loading={deleting}
        title="Delete User"
        description={
          "This action cannot be undone. To confirm, type 'confirm deletion' below to delete this user."
        }
      />
      {/* Touch-friendly card layout for mobile */}
      <div className="block md:hidden space-y-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="rounded-xl shadow-md p-4 flex flex-col gap-2"
          >
            <CardHeader className="flex flex-row items-center justify-between px-0 pb-2">
              <CardTitle className="text-lg font-bold">{user.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUserClick(user.id)}
                  title="View details"
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(user.id)}
                  title="Edit user"
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(user.id)}
                  title="Delete user"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <div className="text-sm text-muted-foreground mb-1">
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div className="text-sm mb-1">
                <span className="font-semibold">Role:</span> {user.role}
              </div>
              <div className="text-sm mb-1">
                <span className="font-semibold">Department:</span>{" "}
                {user.department}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${
                    user.isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Table layout for desktop/tablet */}
      <div className="hidden md:block">
        <UserDetailModal
          userId={selectedUserId}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
        <UserEditModal
          userId={editUserId}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUpdated={handleUserUpdated}
        />
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirmed}
          loading={deleting}
          title="Delete User"
          description={
            "This action cannot be undone. To confirm, type 'confirm deletion' below to delete this user."
          }
        />
        <div>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1d4ed8",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                <th
                  style={{
                    padding: "0.25rem",
                    border: "none",
                    borderTopLeftRadius: "12px",
                    textAlign: "left",
                    paddingLeft: "8px",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "0.25rem",
                    border: "none",
                    textAlign: "left",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "0.25rem",
                    border: "none",
                    textAlign: "left",
                  }}
                >
                  Role
                </th>
                <th
                  style={{
                    padding: "0.25rem",
                    border: "none",
                    textAlign: "left",
                  }}
                >
                  Department
                </th>
                <th
                  style={{
                    padding: "0.25rem",
                    border: "none",
                    textAlign: "left",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "0.25rem",
                    border: "none",
                    borderTopRightRadius: "12px",
                    textAlign: "left",
                    width: "60px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{
                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                    transition: "background 0.2s",
                    borderBottom:
                      idx === users.length - 1 ? "none" : "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e0e7ff")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "#f8fafc" : "#fff")
                  }
                >
                  <td
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      textAlign: "left",
                      fontWeight: 500,
                      paddingLeft: "8px",
                    }}
                  >
                    <button
                      onClick={() => handleUserClick(user.id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        cursor: "pointer",
                        color: "#1d4ed8",
                        fontWeight: 600,
                      }}
                      aria-label={`View details for ${user.name}`}
                      title={`View details for ${user.name}`}
                    >
                      {user.name}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      textAlign: "left",
                    }}
                  >
                    {user.email}
                  </td>
                  <td
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      textAlign: "left",
                    }}
                  >
                    {user.role}
                  </td>
                  <td
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      textAlign: "left",
                    }}
                  >
                    {user.department}
                  </td>
                  <td
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      textAlign: "left",
                    }}
                  >
                    {user.isActive ? (
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>
                        Active
                      </span>
                    ) : (
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      textAlign: "left",
                      width: "60px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(user.id);
                        }}
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(user.id);
                        }}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination controls and user count: always visible, styled for mobile */}
      {pagination && (
        <div className="flex flex-col md:flex-row items-center justify-between pt-4 pb-2 mt-3 gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {pagination.totalUsers} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="lg"
              className="px-4 py-2 md:size-sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              title="Previous page"
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="lg"
              className="px-4 py-2 md:size-sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              title="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
