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

// Types for FullCargo database schema
export type Database = {
  public: {
    Tables: {
      regions: {
        Row: {
          id: number;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          updated_at?: string;
        };
      };
      markets: {
        Row: {
          id: number;
          name: string;
          region_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          region_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          region_id?: number;
          updated_at?: string;
        };
      };
      countries: {
        Row: {
          id: number;
          name: string;
          market_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          market_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          market_id?: number;
          updated_at?: string;
        };
      };
      species: {
        Row: {
          id: number;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          updated_at?: string;
        };
      };
      varieties: {
        Row: {
          id: number;
          name: string;
          species_id: number;
          variety_name_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          species_id: number;
          variety_name_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          species_id?: number;
          variety_name_type?: string;
          updated_at?: string;
        };
      };
      transport_types: {
        Row: {
          id: number;
          name: string;
          transport_category: string;
          transport_subcategory?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          transport_category: string;
          transport_subcategory?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          transport_category?: string;
          transport_subcategory?: string;
          updated_at?: string;
        };
      };
      arrival_ports: {
        Row: {
          id: number;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          updated_at?: string;
        };
      };
      exporters: {
        Row: {
          id: number;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          updated_at?: string;
        };
      };
      importers: {
        Row: {
          id: number;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          updated_at?: string;
        };
      };
      seasons: {
        Row: {
          id: number;
          name: string;
          start_year?: number;
          end_year?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          start_year?: number;
          end_year?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          start_year?: number;
          end_year?: number;
          updated_at?: string;
        };
      };
      shipments_2021_2022: {
        Row: {
          id: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          season_id?: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          updated_at?: string;
        };
      };
      shipments_2022_2023: {
        Row: {
          id: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          season_id?: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          updated_at?: string;
        };
      };
      shipments_2023_2024: {
        Row: {
          id: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          season_id?: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          updated_at?: string;
        };
      };
      shipments_2024_2025: {
        Row: {
          id: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          season_id: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          season_id?: number;
          etd_week?: string;
          region_id?: number;
          market_id?: number;
          country_id?: number;
          transport_type_id?: number;
          species_id?: number;
          variety_id?: number;
          importer_id?: number;
          exporter_id?: number;
          arrival_port_id?: number;
          boxes?: number;
          kilograms?: number;
          updated_at?: string;
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
