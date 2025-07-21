// frontend/lib/supabase-db.ts

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

// Database utility functions for Supabase integration

import { supabase } from "./supabase";
import type { Database } from "./supabase";

type Tables = Database["public"]["Tables"];
type UsersInsert = Tables["users"]["Insert"];
type UsersUpdate = Tables["users"]["Update"];

type AssetsInsert = Tables["assets"]["Insert"];
type AssetsUpdate = Tables["assets"]["Update"];

type AssetHistoryInsert = Tables["asset_history"]["Insert"];

type SettingsUpdate = Tables["settings"]["Update"];

// Keep these types as they are used in the code
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UsersRow = Tables["users"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssetsRow = Tables["assets"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LocationsRow = Tables["locations"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LocationsInsert = Tables["locations"]["Insert"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DepartmentsRow = Tables["departments"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DepartmentsInsert = Tables["departments"]["Insert"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssetHistoryRow = Tables["asset_history"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SettingsRow = Tables["settings"]["Row"];

// Add a type alias for Department
type Department = { id: string; name: string };

// =============================================================================
// USERS
// =============================================================================

export async function getUsers(
  page = 1,
  limit = 10,
  filters?: {
    department?: string;
    role?: string;
  }
) {
  let query = supabase
    .from("users")
    .select(
      `
      id,
      name,
      email,
      role,
      is_active,
      employee_id,
      departments!inner(id, name)
    `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .range((page - 1) * limit, page * limit - 1)
    .order("name");

  // Combine filters using .filter() for explicit AND logic if both are present
  if (
    filters?.department &&
    filters.department !== "all" &&
    filters?.role &&
    filters.role !== "all"
  ) {
    // Log filters for debugging
    console.log("getUsers filters:", filters);
    query = query
      .filter("departments.id", "eq", filters.department)
      .filter("role", "eq", filters.role.toUpperCase());
  } else {
    if (filters?.department && filters.department !== "all") {
      query = query.eq("departments.id", filters.department);
    }
    if (filters?.role && filters.role !== "all") {
      query = query.eq("role", filters.role.toUpperCase());
    }
  }

  const { data, error, count } = await query;

  // Log raw data for debugging
  if (
    filters?.department &&
    filters.department !== "all" &&
    filters?.role &&
    filters.role !== "all"
  ) {
    console.log("getUsers raw data:", data);
  }

  if (error) throw error;

  return {
    data:
      data?.map((user) => {
        let departmentId = "";
        let departmentName = "";
        if (Array.isArray(user.departments)) {
          departmentId = user.departments[0]?.id || "";
          departmentName = user.departments[0]?.name || "";
        } else if (user.departments && typeof user.departments === "object") {
          // Explicitly type user.departments as Department
          const dept = user.departments as Department;
          departmentId = dept.id || "";
          departmentName = dept.name || "";
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          departmentId,
          department: departmentName,
          isActive: user.is_active,
          employeeId: user.employee_id,
        };
      }) || [],
    pagination: {
      page,
      limit,
      totalUsers: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasNextPage: page * limit < (count || 0),
      hasPrevPage: page > 1,
    },
  };
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      name,
      email,
      role,
      employee_id,
      is_active,
      departments!inner(name),
      locations!inner(name)
    `
    )
    .eq("id", userId)
    .single();

  if (error) throw error;

  return {
    data: data
      ? {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          department: Array.isArray(
            data.departments as
              | { name?: string }[]
              | { name?: string }
              | undefined
          )
            ? (data.departments as { name?: string }[])[0]?.name || ""
            : (data.departments as { name?: string } | undefined)?.name || "",
          location: Array.isArray(
            data.locations as
              | { name?: string }[]
              | { name?: string }
              | undefined
          )
            ? (data.locations as { name?: string }[])[0]?.name || ""
            : (data.locations as { name?: string } | undefined)?.name || "",
          isActive: data.is_active,
          employeeId: data.employee_id,
        }
      : null,
  };
}

export async function getUserByEmployeeId(employeeId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      name,
      email,
      role,
      employee_id,
      is_active,
      departments!inner(name),
      locations!inner(name)
    `
    )
    .eq("employee_id", employeeId)
    .single();

  if (error) throw error;

  return {
    data: data
      ? {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          department: Array.isArray(
            data.departments as
              | { name?: string }[]
              | { name?: string }
              | undefined
          )
            ? (data.departments as { name?: string }[])[0]?.name || ""
            : (data.departments as { name?: string } | undefined)?.name || "",
          location: Array.isArray(
            data.locations as
              | { name?: string }[]
              | { name?: string }
              | undefined
          )
            ? (data.locations as { name?: string }[])[0]?.name || ""
            : (data.locations as { name?: string } | undefined)?.name || "",
          isActive: data.is_active,
          employeeId: data.employee_id,
        }
      : null,
  };
}

export async function createUser(
  userData: Omit<UsersInsert, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) throw error;

  return { user: data };
}

export async function updateUser(
  userId: string,
  updates: Partial<UsersUpdate>
) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  return { data };
}

export async function getNextEmployeeId() {
  const { data, error } = await supabase
    .from("users")
    .select("employee_id")
    .order("employee_id", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned

  if (!data) {
    return { nextEmployeeId: "EMP000001" };
  }

  const lastId = data.employee_id;
  const match = lastId.match(/EMP(\d+)/);

  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return { nextEmployeeId: `EMP${nextNum.toString().padStart(6, "0")}` };
  }

  return { nextEmployeeId: "EMP000001" };
}

// =============================================================================
// ASSETS
// =============================================================================

export async function getAssets(
  page = 1,
  limit = 10,
  filters?: {
    type?: string;
    state?: string;
    location?: string;
    assignedTo?: string;
  }
) {
  let query = supabase
    .from("assets")
    .select(
      `
      id,
      asset_number,
      type,
      description,
      serial_number,
      purchase_price,
      purchase_date,
      state,
      location_id,
      assigned_to,
      employee_id,
      department,
      notes,
      created_at,
      updated_at,
      locations!inner(name)
    `
    )
    .is("deleted_at", null)
    .range((page - 1) * limit, page * limit - 1)
    .order("asset_number");

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type.toUpperCase());
  }

  if (filters?.state && filters.state !== "all") {
    query = query.eq("state", filters.state.toUpperCase());
  }

  if (filters?.location && filters.location !== "all") {
    query = query.eq("locations.name", filters.location);
  }

  if (filters?.assignedTo === "assigned") {
    query = query.not("assigned_to", "is", null);
  } else if (filters?.assignedTo === "unassigned") {
    query = query.is("assigned_to", null);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data:
      data?.map((asset) => ({
        id: asset.id,
        assetNumber: asset.asset_number,
        type: asset.type,
        description: asset.description,
        serialNumber: asset.serial_number,
        purchasePrice: asset.purchase_price,
        purchaseDate: asset.purchase_date,
        state: asset.state,
        location: Array.isArray(
          asset.locations as { name?: string }[] | { name?: string } | undefined
        )
          ? (asset.locations as { name?: string }[])[0]?.name || ""
          : (asset.locations as { name?: string } | undefined)?.name || "",
        assignedTo: asset.assigned_to,
        employeeId: asset.employee_id,
        department: asset.department,
        notes: asset.notes,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      })) || [],
    pagination: {
      page,
      limit,
      totalAssets: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasNextPage: page * limit < (count || 0),
      hasPrevPage: page > 1,
    },
  };
}

export async function getAssetById(assetId: string) {
  const { data, error } = await supabase
    .from("assets")
    .select(
      `
      id,
      asset_number,
      type,
      description,
      serial_number,
      purchase_price,
      purchase_date,
      state,
      location_id,
      assigned_to,
      employee_id,
      department,
      notes,
      created_at,
      updated_at,
      locations!inner(name)
    `
    )
    .eq("id", assetId)
    .is("deleted_at", null)
    .single();

  if (error) throw error;

  return {
    data: data
      ? {
          id: data.id,
          assetNumber: data.asset_number,
          type: data.type,
          description: data.description,
          serialNumber: data.serial_number,
          purchasePrice: data.purchase_price,
          purchaseDate: data.purchase_date,
          state: data.state,
          location: Array.isArray(
            data.locations as
              | { name?: string }[]
              | { name?: string }
              | undefined
          )
            ? (data.locations as { name?: string }[])[0]?.name || ""
            : (data.locations as { name?: string } | undefined)?.name || "",
          assignedTo: data.assigned_to,
          employeeId: data.employee_id,
          department: data.department,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null,
  };
}

export async function createAsset(
  assetData: Omit<AssetsInsert, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("assets")
    .insert(assetData)
    .select()
    .single();

  if (error) throw error;

  return { asset: data };
}

export async function updateAsset(
  assetId: string,
  updates: Partial<AssetsUpdate>
) {
  const { data, error } = await supabase
    .from("assets")
    .update(updates)
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  return { data };
}

export async function deleteAsset(assetId: string) {
  const { error } = await supabase
    .from("assets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", assetId);

  if (error) throw error;

  return { success: true };
}

// =============================================================================
// LOCATIONS & DEPARTMENTS
// =============================================================================

export async function getLocations() {
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return { locations: data || [] };
}

export async function getDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("name")
    .order("name");

  if (error) throw error;

  return { departments: data?.map((d) => d.name) || [] };
}

// =============================================================================
// ASSET HISTORY
// =============================================================================

export async function createAssetHistory(
  historyData: Omit<AssetHistoryInsert, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("asset_history")
    .insert(historyData)
    .select()
    .single();

  if (error) throw error;

  return { history: data };
}

// =============================================================================
// SETTINGS
// =============================================================================

export async function getSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  if (error) throw error;

  return data;
}

export async function updateSettings(updates: Partial<SettingsUpdate>) {
  const { data, error } = await supabase
    .from("settings")
    .update(updates)
    .select()
    .single();

  if (error) throw error;

  return { data };
}

// =============================================================================
// SEARCH
// =============================================================================

export async function searchAssets(query: string) {
  const { data, error } = await supabase
    .from("assets")
    .select(
      `
      id,
      asset_number,
      type,
      description,
      serial_number,
      state,
      locations!inner(name)
    `
    )
    .is("deleted_at", null)
    .or(
      `asset_number.ilike.%${query}%,description.ilike.%${query}%,serial_number.ilike.%${query}%`
    )
    .limit(10);

  if (error) throw error;

  return {
    data:
      data?.map((asset) => ({
        id: asset.id,
        assetNumber: asset.asset_number,
        type: asset.type,
        description: asset.description,
        serialNumber: asset.serial_number,
        state: asset.state,
        location: Array.isArray(
          asset.locations as { name?: string }[] | { name?: string } | undefined
        )
          ? (asset.locations as { name?: string }[])[0]?.name || ""
          : (asset.locations as { name?: string } | undefined)?.name || "",
      })) || [],
  };
}
