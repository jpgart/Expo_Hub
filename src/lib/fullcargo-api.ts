import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

// FullCargo Types
type Region = Database['public']['Tables']['regions']['Row'];
type Market = Database['public']['Tables']['markets']['Row'];
type Country = Database['public']['Tables']['countries']['Row'];
type Species = Database['public']['Tables']['species']['Row'];
type Variety = Database['public']['Tables']['varieties']['Row'];
type TransportType = Database['public']['Tables']['transport_types']['Row'];
type ArrivalPort = Database['public']['Tables']['arrival_ports']['Row'];
type Exporter = Database['public']['Tables']['exporters']['Row'];
type Importer = Database['public']['Tables']['importers']['Row'];
type Season = Database['public']['Tables']['seasons']['Row'];

// Shipment types for different seasons
type Shipment2021 = Database['public']['Tables']['shipments_2021_2022']['Row'];
type Shipment2022 = Database['public']['Tables']['shipments_2022_2023']['Row'];
type Shipment2023 = Database['public']['Tables']['shipments_2023_2024']['Row'];
type Shipment2024 = Database['public']['Tables']['shipments_2024_2025']['Row'];

// Combined shipment type for unified handling
export type Shipment = {
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
  // Joined data for display
  region_name?: string;
  market_name?: string;
  country_name?: string;
  species_name?: string;
  variety_name?: string;
  transport_name?: string;
  arrival_port_name?: string;
  exporter_name?: string;
  importer_name?: string;
  season_name?: string;
};

// FullCargo API
export const fullCargoApi = {
  // ========================================
  // MASTER DATA APIs
  // ========================================

  // Get all regions
  async getRegions(): Promise<Region[]> {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  },

  // Get markets by region
  async getMarkets(regionId?: number): Promise<Market[]> {
    try {
      let query = supabase.from('markets').select('*');

      if (regionId) {
        query = query.eq('region_id', regionId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  },

  // Get countries by market
  async getCountries(marketId?: number): Promise<Country[]> {
    try {
      let query = supabase.from('countries').select('*');

      if (marketId) {
        query = query.eq('market_id', marketId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  // Get all species
  async getSpecies(): Promise<Species[]> {
    try {
      const { data, error } = await supabase
        .from('species')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching species:', error);
      return [];
    }
  },

  // Get varieties by species
  async getVarieties(speciesId?: number): Promise<Variety[]> {
    try {
      let query = supabase.from('varieties').select('*');

      if (speciesId) {
        query = query.eq('species_id', speciesId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching varieties:', error);
      return [];
    }
  },

  // Get all transport types
  async getTransportTypes(): Promise<TransportType[]> {
    try {
      const { data, error } = await supabase
        .from('transport_types')
        .select('*')
        .order('transport_category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transport types:', error);
      return [];
    }
  },

  // Get all arrival ports
  async getArrivalPorts(): Promise<ArrivalPort[]> {
    try {
      const { data, error } = await supabase
        .from('arrival_ports')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching arrival ports:', error);
      return [];
    }
  },

  // Get all exporters
  async getExporters(): Promise<Exporter[]> {
    try {
      const { data, error } = await supabase
        .from('exporters')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exporters:', error);
      return [];
    }
  },

  // Get all importers
  async getImporters(): Promise<Importer[]> {
    try {
      const { data, error } = await supabase
        .from('importers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching importers:', error);
      return [];
    }
  },

  // Get all seasons
  async getSeasons(): Promise<Season[]> {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('start_year', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  },

  // ========================================
  // SHIPMENTS APIs
  // ========================================

  // Get shipments with full joins for a specific season
  async getShipments({
    season = '2024_2025',
    page = 1,
    limit = 50,
    filters = {}
  }: {
    season?: string;
    page?: number;
    limit?: number;
    filters?: {
      region_id?: number;
      market_id?: number;
      country_id?: number;
      species_id?: number;
      variety_id?: number;
      transport_type_id?: number;
      exporter_id?: number;
      importer_id?: number;
      arrival_port_id?: number;
    };
  }) {
    try {
      const tableName = `shipments_${season}`;

      let query = supabase.from(tableName).select(
        `
					*,
					regions!region_id(name),
					markets!market_id(name),
					countries!country_id(name),
					species!species_id(name),
					varieties!variety_id(name),
					transport_types!transport_type_id(name, transport_category),
					arrival_ports!arrival_port_id(name),
					exporters!exporter_id(name),
					importers!importer_id(name),
					seasons!season_id(name)
				`,
        { count: 'exact' }
      );

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      const { data: shipments, error, count } = await query;

      if (error) throw error;

      // Transform data to include joined names
      const transformedShipments: Shipment[] = (shipments || []).map(
        (shipment: any) => ({
          ...shipment,
          region_name: shipment.regions?.name,
          market_name: shipment.markets?.name,
          country_name: shipment.countries?.name,
          species_name: shipment.species?.name,
          variety_name: shipment.varieties?.name,
          transport_name: shipment.transport_types?.name,
          arrival_port_name: shipment.arrival_ports?.name,
          exporter_name: shipment.exporters?.name,
          importer_name: shipment.importers?.name,
          season_name: shipment.seasons?.name
        })
      );

      return {
        success: true,
        time: new Date().toISOString(),
        message: 'Shipments retrieved successfully',
        total_shipments: count || 0,
        offset,
        limit,
        season,
        shipments: transformedShipments
      };
    } catch (error) {
      console.error('Error fetching shipments:', error);
      return {
        success: false,
        message: 'Failed to fetch shipments',
        total_shipments: 0,
        offset: 0,
        limit,
        season,
        shipments: []
      };
    }
  },

  // Get shipment analytics by season
  async getShipmentAnalytics(season = '2024_2025') {
    try {
      const tableName = `shipments_${season}`;

      // Total shipments and volume
      const { data: totals, error: totalsError } = await supabase
        .from(tableName)
        .select('boxes, kilograms')
        .not('boxes', 'is', null)
        .not('kilograms', 'is', null);

      if (totalsError) throw totalsError;

      // Top species by volume
      const { data: speciesStats, error: speciesError } = await supabase
        .from(tableName)
        .select(
          `
					species_id,
					species!species_id(name),
					boxes,
					kilograms
				`
        )
        .not('species_id', 'is', null)
        .not('boxes', 'is', null);

      if (speciesError) throw speciesError;

      // Top countries by volume
      const { data: countryStats, error: countryError } = await supabase
        .from(tableName)
        .select(
          `
					country_id,
					countries!country_id(name),
					boxes,
					kilograms
				`
        )
        .not('country_id', 'is', null)
        .not('boxes', 'is', null);

      if (countryError) throw countryError;

      // Calculate totals
      const totalBoxes =
        totals?.reduce((sum, item) => sum + (item.boxes || 0), 0) || 0;
      const totalKilograms =
        totals?.reduce((sum, item) => sum + (item.kilograms || 0), 0) || 0;
      const totalShipments = totals?.length || 0;

      // Group species stats
      const speciesGrouped = speciesStats?.reduce((acc: any, item: any) => {
        const speciesName = item.species?.name || 'Unknown';
        if (!acc[speciesName]) {
          acc[speciesName] = { boxes: 0, kilograms: 0, shipments: 0 };
        }
        acc[speciesName].boxes += item.boxes || 0;
        acc[speciesName].kilograms += item.kilograms || 0;
        acc[speciesName].shipments += 1;
        return acc;
      }, {});

      // Group country stats
      const countryGrouped = countryStats?.reduce((acc: any, item: any) => {
        const countryName = item.countries?.name || 'Unknown';
        if (!acc[countryName]) {
          acc[countryName] = { boxes: 0, kilograms: 0, shipments: 0 };
        }
        acc[countryName].boxes += item.boxes || 0;
        acc[countryName].kilograms += item.kilograms || 0;
        acc[countryName].shipments += 1;
        return acc;
      }, {});

      return {
        season,
        totals: {
          shipments: totalShipments,
          boxes: totalBoxes,
          kilograms: totalKilograms
        },
        topSpecies: Object.entries(speciesGrouped || {})
          .map(([name, stats]: [string, any]) => ({ name, ...stats }))
          .sort((a, b) => b.kilograms - a.kilograms)
          .slice(0, 10),
        topCountries: Object.entries(countryGrouped || {})
          .map(([name, stats]: [string, any]) => ({ name, ...stats }))
          .sort((a, b) => b.kilograms - a.kilograms)
          .slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        season,
        totals: { shipments: 0, boxes: 0, kilograms: 0 },
        topSpecies: [],
        topCountries: []
      };
    }
  },

  // Get shipment by ID (from any season table)
  async getShipmentById(id: number, season = '2024_2025') {
    try {
      const tableName = `shipments_${season}`;

      const { data: shipment, error } = await supabase
        .from(tableName)
        .select(
          `
					*,
					regions!region_id(name),
					markets!market_id(name),
					countries!country_id(name),
					species!species_id(name),
					varieties!variety_id(name),
					transport_types!transport_type_id(name, transport_category),
					arrival_ports!arrival_port_id(name),
					exporters!exporter_id(name),
					importers!importer_id(name),
					seasons!season_id(name)
				`
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Shipment with ID ${id} found`,
        shipment: {
          ...shipment,
          region_name: shipment.regions?.name,
          market_name: shipment.markets?.name,
          country_name: shipment.countries?.name,
          species_name: shipment.species?.name,
          variety_name: shipment.varieties?.name,
          transport_name: shipment.transport_types?.name,
          arrival_port_name: shipment.arrival_ports?.name,
          exporter_name: shipment.exporters?.name,
          importer_name: shipment.importers?.name,
          season_name: shipment.seasons?.name
        }
      };
    } catch (error) {
      console.error('Error fetching shipment:', error);
      return {
        success: false,
        message: `Shipment with ID ${id} not found`
      };
    }
  },

  // Get weekly shipments summary
  async getWeeklyShipments(season = '2024_2025') {
    try {
      const tableName = `shipments_${season}`;

      const { data, error } = await supabase
        .from(tableName)
        .select('etd_week, boxes, kilograms')
        .not('etd_week', 'is', null)
        .not('boxes', 'is', null);

      if (error) throw error;

      // Group by week
      const weeklyStats = data?.reduce((acc: any, item) => {
        const week = item.etd_week;
        if (!acc[week]) {
          acc[week] = { week, boxes: 0, kilograms: 0, shipments: 0 };
        }
        acc[week].boxes += item.boxes || 0;
        acc[week].kilograms += item.kilograms || 0;
        acc[week].shipments += 1;
        return acc;
      }, {});

      return Object.values(weeklyStats || {}).sort((a: any, b: any) =>
        a.week.localeCompare(b.week)
      );
    } catch (error) {
      console.error('Error fetching weekly shipments:', error);
      return [];
    }
  },

  // Search across multiple tables
  async searchGlobal(searchTerm: string, limit = 20) {
    try {
      const searches = await Promise.all([
        // Search species
        supabase
          .from('species')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(limit),

        // Search varieties
        supabase
          .from('varieties')
          .select('id, name, species!species_id(name)')
          .ilike('name', `%${searchTerm}%`)
          .limit(limit),

        // Search countries
        supabase
          .from('countries')
          .select('id, name, markets!market_id(name)')
          .ilike('name', `%${searchTerm}%`)
          .limit(limit),

        // Search exporters
        supabase
          .from('exporters')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(limit),

        // Search importers
        supabase
          .from('importers')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(limit)
      ]);

      return {
        species: searches[0].data || [],
        varieties: searches[1].data || [],
        countries: searches[2].data || [],
        exporters: searches[3].data || [],
        importers: searches[4].data || []
      };
    } catch (error) {
      console.error('Error in global search:', error);
      return {
        species: [],
        varieties: [],
        countries: [],
        exporters: [],
        importers: []
      };
    }
  }
};
