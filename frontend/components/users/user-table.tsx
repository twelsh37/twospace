"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { UserFilterState } from "./user-filters";
import { UserDetailModal } from "./user-detail-modal";

interface UserTableProps {
  filters: UserFilterState;
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

interface Pagination {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function UserTable({ filters, page, onPageChange }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
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
        setPagination(null);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleUserClick(user.id)}
                >
                  {user.name}
                </button>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/users/${user.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/users/${user.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Pagination and count */}
      {pagination && (
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {pagination.totalUsers} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
