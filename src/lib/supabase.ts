import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side client for admin operations (be careful with this)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types for our database tables
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          description: string;
          price: number;
          photo_url: string;
          category: string;
          created_at: string;
          updated_at: string;
          user_id?: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          price: number;
          photo_url: string;
          category: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          price?: number;
          photo_url?: string;
          category?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      kanban_columns: {
        Row: {
          id: string;
          title: string;
          position: number;
          created_at: string;
          user_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          position: number;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          position?: number;
          user_id?: string;
        };
      };
      kanban_tasks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          status: string;
          column_id: string;
          position: number;
          created_at: string;
          updated_at: string;
          user_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status: string;
          column_id: string;
          position: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: string;
          column_id?: string;
          position?: number;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
