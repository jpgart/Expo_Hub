import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Filters } from '@/types/exporters';

// Check if Supabase environment variables are available and valid
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_');

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables not configured properly');
}

const supabase = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            'Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.'
        },
        { status: 503 }
      );
    }

    const filters: Filters = await request.json();

    // Build filter parameters for RPC calls
    const buildFilterParams = () => {
      const params: any = {};

      if (filters.seasonIds && filters.seasonIds.length > 0) {
        params.p_season_ids = filters.seasonIds;
      }
      if (filters.exporterIds && filters.exporterIds.length > 0) {
        params.p_exporter_ids = filters.exporterIds;
      }
      if (filters.speciesIds && filters.speciesIds.length > 0) {
        params.p_species_ids = filters.speciesIds;
      }
      if (filters.varietyIds && filters.varietyIds.length > 0) {
        params.p_variety_ids = filters.varietyIds;
      }
      if (filters.marketIds && filters.marketIds.length > 0) {
        params.p_market_ids = filters.marketIds;
      }
      if (filters.countryIds && filters.countryIds.length > 0) {
        params.p_country_ids = filters.countryIds;
      }
      if (filters.regionIds && filters.regionIds.length > 0) {
        params.p_region_ids = filters.regionIds;
      }
      if (filters.transportTypeIds && filters.transportTypeIds.length > 0) {
        params.p_transport_type_ids = filters.transportTypeIds;
      }
      if (filters.arrivalPortIds && filters.arrivalPortIds.length > 0) {
        params.p_arrival_port_ids = filters.arrivalPortIds;
      }
      if (filters.weekFrom) {
        params.p_week_from = filters.weekFrom;
      }
      if (filters.weekTo) {
        params.p_week_to = filters.weekTo;
      }

      return params;
    };

    const filterParams = buildFilterParams();

    // Fetch all data in parallel using RPC functions with filters
    const [
      kpisResponse,
      timeseriesResponse,
      topsResponse,
      rankingsResponse,
      yoyResponse,
      retentionResponse
    ] = await Promise.all([
      // KPIs with filters
      supabase.rpc('get_exporter_kpis', {
        p_season_ids: filterParams.p_season_ids || null,
        p_exporter_ids: filterParams.p_exporter_ids || null,
        p_species_ids: filterParams.p_species_ids || null,
        p_variety_ids: filterParams.p_variety_ids || null,
        p_market_ids: filterParams.p_market_ids || null,
        p_country_ids: filterParams.p_country_ids || null,
        p_region_ids: filterParams.p_region_ids || null,
        p_transport_type_ids: filterParams.p_transport_type_ids || null,
        p_week_from: filterParams.p_week_from || null,
        p_week_to: filterParams.p_week_to || null
      }),

      // Timeseries with filters
      supabase.rpc('get_exporter_timeseries', {
        p_granularity: filters.granularity || 'month',
        p_season_ids: filterParams.p_season_ids || null,
        p_exporter_ids: filterParams.p_exporter_ids || null,
        p_species_ids: filterParams.p_species_ids || null,
        p_variety_ids: filterParams.p_variety_ids || null,
        p_market_ids: filterParams.p_market_ids || null,
        p_country_ids: filterParams.p_country_ids || null,
        p_region_ids: filterParams.p_region_ids || null,
        p_transport_type_ids: filterParams.p_transport_type_ids || null,
        p_week_from: filterParams.p_week_from || null,
        p_week_to: filterParams.p_week_to || null
      }),

      // Tops with filters (we'll get all categories and filter in code)
      supabase.rpc('get_exporter_tops', {
        p_top_type: 'importers',
        p_season_ids: filterParams.p_season_ids || null,
        p_exporter_ids: filterParams.p_exporter_ids || null,
        p_species_ids: filterParams.p_species_ids || null,
        p_variety_ids: filterParams.p_variety_ids || null,
        p_market_ids: filterParams.p_market_ids || null,
        p_country_ids: filterParams.p_country_ids || null,
        p_region_ids: filterParams.p_region_ids || null,
        p_transport_type_ids: filterParams.p_transport_type_ids || null,
        p_week_from: filterParams.p_week_from || null,
        p_week_to: filterParams.p_week_to || null
      }),

      // Rankings with filters
      supabase.rpc('get_exporter_rankings', {
        p_season_ids: filterParams.p_season_ids || null,
        p_species_ids: filterParams.p_species_ids || null,
        p_variety_ids: filterParams.p_variety_ids || null,
        p_market_ids: filterParams.p_market_ids || null,
        p_country_ids: filterParams.p_country_ids || null,
        p_region_ids: filterParams.p_region_ids || null,
        p_transport_type_ids: filterParams.p_transport_type_ids || null,
        p_week_from: filterParams.p_week_from || null,
        p_week_to: filterParams.p_week_to || null
      }),

      // Get YoY data if we have season filters
      filters.seasonIds && filters.seasonIds.length >= 2
        ? supabase.rpc('get_exporter_yoy_growth', {
            p_current_season_id: Math.max(...filters.seasonIds),
            p_previous_season_id: Math.min(...filters.seasonIds),
            p_exporter_ids: filters.exporterIds || null
          })
        : Promise.resolve({ data: null, error: null }),

      // Get retention data if we have season filters
      filters.seasonIds && filters.seasonIds.length >= 2
        ? supabase.rpc('get_exporter_importer_retention', {
            p_current_season_id: Math.max(...filters.seasonIds),
            p_previous_season_id: Math.min(...filters.seasonIds),
            p_exporter_ids: filters.exporterIds || null
          })
        : Promise.resolve({ data: null, error: null })
    ]);

    const [
      kpisData,
      timeseriesData,
      topsData,
      rankingsData,
      yoyData,
      retentionData
    ] = await Promise.all([
      Promise.resolve(kpisResponse.data || []),
      Promise.resolve(timeseriesResponse.data || []),
      Promise.resolve(topsResponse.data || []),
      Promise.resolve(rankingsResponse.data || []),
      Promise.resolve(yoyResponse.data || []),
      Promise.resolve(retentionResponse.data || [])
    ]);

    // Process KPIs with YoY and retention data
    const kpisArray = Array.isArray(kpisData) ? kpisData : [];
    const yoyArray = Array.isArray(yoyData) ? yoyData : [];
    const retentionArray = Array.isArray(retentionData) ? retentionData : [];

    // Create lookup maps for YoY and retention data
    const yoyMap = new Map(yoyArray.map((row: any) => [row.exporter_id, row]));
    const retentionMap = new Map(
      retentionArray.map((row: any) => [row.exporter_id, row])
    );

    const exporters = kpisArray.map((row: any) => {
      const yoy = yoyMap.get(row.exporter_id);
      const retention = retentionMap.get(row.exporter_id);

      return {
        exporterId: row.exporter_id,
        exporterName: row.exporter_name,
        kilograms: row.total_kilograms,
        boxes: row.total_boxes,
        kgPerBox: row.kg_per_box,
        yoyKg: yoy?.yoy_kg_growth_pct || null,
        yoyBoxes: yoy?.yoy_boxes_growth_pct || null,
        importersActive: row.importers_active,
        importersRetention: retention?.retention_rate || null,
        varietiesActive: row.varieties_active
      };
    });

    // Calculate global KPIs with YoY data
    const globalYoy =
      yoyArray.length > 0
        ? yoyArray.reduce(
            (acc, row) => ({
              currentKg: acc.currentKg + (row.current_kilograms || 0),
              previousKg: acc.previousKg + (row.previous_kilograms || 0),
              currentBoxes: acc.currentBoxes + (row.current_boxes || 0),
              previousBoxes: acc.previousBoxes + (row.previous_boxes || 0)
            }),
            { currentKg: 0, previousKg: 0, currentBoxes: 0, previousBoxes: 0 }
          )
        : null;

    const global = {
      kilograms: exporters.reduce((sum, exp) => sum + exp.kilograms, 0),
      boxes: exporters.reduce((sum, exp) => sum + exp.boxes, 0),
      kgPerBox:
        exporters.reduce((sum, exp) => sum + exp.boxes, 0) > 0
          ? exporters.reduce((sum, exp) => sum + exp.kilograms, 0) /
            exporters.reduce((sum, exp) => sum + exp.boxes, 0)
          : null,
      yoyKg:
        globalYoy && globalYoy.previousKg > 0
          ? ((globalYoy.currentKg - globalYoy.previousKg) /
              globalYoy.previousKg) *
            100
          : null,
      yoyBoxes:
        globalYoy && globalYoy.previousBoxes > 0
          ? ((globalYoy.currentBoxes - globalYoy.previousBoxes) /
              globalYoy.previousBoxes) *
            100
          : null,
      importersActive: new Set(
        exporters.flatMap((exp) =>
          Array.from(
            { length: exp.importersActive },
            (_, i) => `${exp.exporterId}-${i}`
          )
        )
      ).size,
      importersRetention:
        retentionArray.length > 0
          ? retentionArray.reduce(
              (sum, row) => sum + (row.retention_rate || 0),
              0
            ) / retentionArray.length
          : null,
      varietiesActive: new Set(
        exporters.flatMap((exp) =>
          Array.from(
            { length: exp.varietiesActive },
            (_, i) => `${exp.exporterId}-${i}`
          )
        )
      ).size
    };

    // Process timeseries
    const timeseriesArray = Array.isArray(timeseriesData) ? timeseriesData : [];
    const timeseries = timeseriesArray.map((row: any) => ({
      period: row.period,
      kilograms: row.kilograms,
      boxes: row.boxes
    }));

    // For tops, we need to get data for each category separately
    const topsCategories = [
      'importers',
      'markets',
      'countries',
      'varieties',
      'arrival_ports'
    ];
    const topsPromises = topsCategories.map((category) =>
      supabase.rpc('get_exporter_tops', {
        p_top_type: category,
        p_season_ids: filterParams.p_season_ids || null,
        p_exporter_ids: filterParams.p_exporter_ids || null,
        p_species_ids: filterParams.p_species_ids || null,
        p_variety_ids: filterParams.p_variety_ids || null,
        p_market_ids: filterParams.p_market_ids || null,
        p_country_ids: filterParams.p_country_ids || null,
        p_region_ids: filterParams.p_region_ids || null,
        p_transport_type_ids: filterParams.p_transport_type_ids || null,
        p_week_from: filterParams.p_week_from || null,
        p_week_to: filterParams.p_week_to || null
      })
    );

    const topsResults = await Promise.all(topsPromises);
    const topsByCategory: any = {};

    topsCategories.forEach((category, index) => {
      const data = topsResults[index].data || [];
      topsByCategory[category] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        kilograms: row.kilograms,
        boxes: row.boxes,
        sharePct: row.share_pct || 0
      }));
    });

    // Process rankings
    const rankingsArray = Array.isArray(rankingsData) ? rankingsData : [];
    const rankings = rankingsArray.map((row: any) => ({
      exporterId: row.exporter_id,
      exporterName: row.exporter_name,
      seasonId: row.season_id,
      seasonName: row.season_name,
      kilograms: row.kilograms,
      boxes: row.boxes,
      rank: row.rank
    }));

    return NextResponse.json({
      kpis: { global, exporters },
      charts: {
        timeseries,
        topImporters: topsByCategory.importers || [],
        topMarkets: topsByCategory.markets || [],
        topCountries: topsByCategory.countries || [],
        topVarieties: topsByCategory.varieties || [],
        transportSplit: topsByCategory.arrival_ports || [],
        arrivalPorts: topsByCategory.arrival_ports || [],
        rankings
      }
    });
  } catch (error) {
    console.error('Error in exporters API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
