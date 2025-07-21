// frontend/lib/supabase.ts

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

// Supabase client configuration for Asset Management System

import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create Supabase client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Create browser client for client-side operations
export const createClientComponentClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Create server client for server-side operations
export const createServerComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          employee_id: string;
          location_id: string;
          department_id: string;
          role: "ADMIN" | "USER";
          password_hash?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          employee_id: string;
          location_id: string;
          department_id: string;
          role?: "ADMIN" | "USER";
          password_hash?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          employee_id?: string;
          location_id?: string;
          department_id?: string;
          role?: "ADMIN" | "USER";
          password_hash?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          location_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          asset_number: string;
          type: "MOBILE_PHONE" | "TABLET" | "DESKTOP" | "LAPTOP" | "MONITOR";
          description: string;
          serial_number?: string;
          purchase_price?: number;
          purchase_date?: string;
          state:
            | "AVAILABLE"
            | "SIGNED_OUT"
            | "BUILDING"
            | "READY_TO_GO"
            | "ISSUED";
          location_id: string;
          assigned_to?: string;
          employee_id?: string;
          department?: string;
          notes?: string;
          deleted_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_number: string;
          type: "MOBILE_PHONE" | "TABLET" | "DESKTOP" | "LAPTOP" | "MONITOR";
          description: string;
          serial_number?: string;
          purchase_price?: number;
          purchase_date?: string;
          state?:
            | "AVAILABLE"
            | "SIGNED_OUT"
            | "BUILDING"
            | "READY_TO_GO"
            | "ISSUED";
          location_id: string;
          assigned_to?: string;
          employee_id?: string;
          department?: string;
          notes?: string;
          deleted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_number?: string;
          type?: "MOBILE_PHONE" | "TABLET" | "DESKTOP" | "LAPTOP" | "MONITOR";
          description?: string;
          serial_number?: string;
          purchase_price?: number;
          purchase_date?: string;
          state?:
            | "AVAILABLE"
            | "SIGNED_OUT"
            | "BUILDING"
            | "READY_TO_GO"
            | "ISSUED";
          location_id?: string;
          assigned_to?: string;
          employee_id?: string;
          department?: string;
          notes?: string;
          deleted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      asset_history: {
        Row: {
          id: string;
          asset_id: string;
          changed_by: string;
          change_type:
            | "CREATED"
            | "UPDATED"
            | "STATE_CHANGED"
            | "ASSIGNED"
            | "UNASSIGNED"
            | "DELETED";
          previous_state?: string;
          new_state?: string;
          details: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          changed_by: string;
          change_type:
            | "CREATED"
            | "UPDATED"
            | "STATE_CHANGED"
            | "ASSIGNED"
            | "UNASSIGNED"
            | "DELETED";
          previous_state?: string;
          new_state?: string;
          details: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          changed_by?: string;
          change_type?:
            | "CREATED"
            | "UPDATED"
            | "STATE_CHANGED"
            | "ASSIGNED"
            | "UNASSIGNED"
            | "DELETED";
          previous_state?: string;
          new_state?: string;
          details?: Record<string, unknown>;
          created_at?: string;
        };
      };
      asset_sequences: {
        Row: {
          id: string;
          asset_type:
            | "MOBILE_PHONE"
            | "TABLET"
            | "DESKTOP"
            | "LAPTOP"
            | "MONITOR";
          next_sequence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_type:
            | "MOBILE_PHONE"
            | "TABLET"
            | "DESKTOP"
            | "LAPTOP"
            | "MONITOR";
          next_sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_type?:
            | "MOBILE_PHONE"
            | "TABLET"
            | "DESKTOP"
            | "LAPTOP"
            | "MONITOR";
          next_sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          report_cache_duration: number;
          depreciation_settings?: Record<string, unknown>;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_cache_duration?: number;
          depreciation_settings?: Record<string, unknown>;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_cache_duration?: number;
          depreciation_settings?: Record<string, unknown>;
          updated_at?: string;
        };
      };
    };
    Enums: {
      asset_type: "MOBILE_PHONE" | "TABLET" | "DESKTOP" | "LAPTOP" | "MONITOR";
      asset_state:
        | "AVAILABLE"
        | "SIGNED_OUT"
        | "BUILDING"
        | "READY_TO_GO"
        | "ISSUED";
      user_role: "ADMIN" | "USER";
    };
  };
};
