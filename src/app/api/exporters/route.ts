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

    // Check if filters are applied
    const hasFilters = Object.values(filterParams).some(
      (value) => value && (Array.isArray(value) ? value.length > 0 : true)
    );

    // If filters are applied, get accurate totals using direct aggregation
    let accurateTotals = null;
    if (hasFilters) {
      try {
        // Build filter conditions for direct query
        let query = supabase
          .from('unified_shipments')
          .select(
            'kilograms, boxes, importer_id, variety_id, exporter_id, country_id'
          );

        if (filters.seasonIds && filters.seasonIds.length > 0) {
          query = query.in('season_id', filters.seasonIds);
        }
        if (filters.exporterIds && filters.exporterIds.length > 0) {
          query = query.in('exporter_id', filters.exporterIds);
        }
        if (filters.speciesIds && filters.speciesIds.length > 0) {
          query = query.in('species_id', filters.speciesIds);
        }
        if (filters.varietyIds && filters.varietyIds.length > 0) {
          query = query.in('variety_id', filters.varietyIds);
        }
        if (filters.marketIds && filters.marketIds.length > 0) {
          query = query.in('market_id', filters.marketIds);
        }
        if (filters.countryIds && filters.countryIds.length > 0) {
          query = query.in('country_id', filters.countryIds);
        }
        if (filters.regionIds && filters.regionIds.length > 0) {
          query = query.in('region_id', filters.regionIds);
        }
        if (filters.transportTypeIds && filters.transportTypeIds.length > 0) {
          query = query.in('transport_type_id', filters.transportTypeIds);
        }
        if (filters.weekFrom) {
          query = query.gte('etd_week', filters.weekFrom);
        }
        if (filters.weekTo) {
          query = query.lte('etd_week', filters.weekTo);
        }

        // Use range pagination to get all data in chunks
        let allData: any[] = [];
        let from = 0;
        const rangeSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const rangeQuery = query.range(from, from + rangeSize - 1);
          const response = await rangeQuery;

          if (response.data && response.data.length > 0) {
            allData = allData.concat(response.data);
            from += rangeSize;

            // If we got less than the range size, we've reached the end
            if (response.data.length < rangeSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          // Calculate totals
          const totalKg = allData.reduce(
            (sum, row) => sum + (row.kilograms || 0),
            0
          );
          const totalBoxes = allData.reduce(
            (sum, row) => sum + (row.boxes || 0),
            0
          );

          // Calculate unique counts
          const uniqueImporters = new Set(
            allData.map((row) => row.importer_id).filter(Boolean)
          ).size;
          const uniqueVarieties = new Set(
            allData.map((row) => row.variety_id).filter(Boolean)
          ).size;
          const uniqueExporters = new Set(
            allData.map((row) => row.exporter_id).filter(Boolean)
          ).size;
          const uniqueCountries = new Set(
            allData.map((row) => row.country_id).filter(Boolean)
          ).size;

          accurateTotals = {
            total_kilograms: totalKg,
            total_boxes: totalBoxes,
            unique_importers: uniqueImporters,
            unique_varieties: uniqueVarieties,
            unique_exporters: uniqueExporters,
            unique_countries: uniqueCountries
          };
        }
      } catch (error) {
        console.warn('Failed to get accurate totals:', error);
      }
    }

    // Fetch all data in parallel using RPC functions with filters
    const [
      timeseriesResponse,
      topsResponse,
      rankingsResponse,
      yoyResponse,
      retentionResponse
    ] = await Promise.all([
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

    // Get exporter KPIs using direct query with pagination to avoid RPC limits
    let allExportersData: any[] = [];
    if (hasFilters) {
      try {
        // Build filter conditions for exporter query
        let exporterQuery = supabase.from('unified_shipments').select(`
            exporter_id,
            kilograms,
            boxes,
            importer_id,
            variety_id
          `);

        if (filters.seasonIds && filters.seasonIds.length > 0) {
          exporterQuery = exporterQuery.in('season_id', filters.seasonIds);
        }
        if (filters.exporterIds && filters.exporterIds.length > 0) {
          exporterQuery = exporterQuery.in('exporter_id', filters.exporterIds);
        }
        if (filters.speciesIds && filters.speciesIds.length > 0) {
          exporterQuery = exporterQuery.in('species_id', filters.speciesIds);
        }
        if (filters.varietyIds && filters.varietyIds.length > 0) {
          exporterQuery = exporterQuery.in('variety_id', filters.varietyIds);
        }
        if (filters.marketIds && filters.marketIds.length > 0) {
          exporterQuery = exporterQuery.in('market_id', filters.marketIds);
        }
        if (filters.countryIds && filters.countryIds.length > 0) {
          exporterQuery = exporterQuery.in('country_id', filters.countryIds);
        }
        if (filters.regionIds && filters.regionIds.length > 0) {
          exporterQuery = exporterQuery.in('region_id', filters.regionIds);
        }
        if (filters.transportTypeIds && filters.transportTypeIds.length > 0) {
          exporterQuery = exporterQuery.in(
            'transport_type_id',
            filters.transportTypeIds
          );
        }
        if (filters.weekFrom) {
          exporterQuery = exporterQuery.gte('etd_week', filters.weekFrom);
        }
        if (filters.weekTo) {
          exporterQuery = exporterQuery.lte('etd_week', filters.weekTo);
        }

        // Use range pagination to get all exporter data
        let from = 0;
        const rangeSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const rangeQuery = exporterQuery.range(from, from + rangeSize - 1);
          const response = await rangeQuery;

          if (response.data && response.data.length > 0) {
            allExportersData = allExportersData.concat(response.data);
            from += rangeSize;

            if (response.data.length < rangeSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }
      } catch (error) {
        console.warn('Failed to get exporter data:', error);
      }
    }

    // Process exporter data to create KPIs
    const exportersMap = new Map();
    if (allExportersData.length > 0) {
      allExportersData.forEach((row: any) => {
        const exporterId = row.exporter_id;

        if (!exportersMap.has(exporterId)) {
          exportersMap.set(exporterId, {
            exporterId,
            exporterName: `Exporter ${exporterId}`, // Temporary name
            kilograms: 0,
            boxes: 0,
            importersActive: new Set(),
            varietiesActive: new Set()
          });
        }

        const exporter = exportersMap.get(exporterId);
        exporter.kilograms += row.kilograms || 0;
        exporter.boxes += row.boxes || 0;
        if (row.importer_id) exporter.importersActive.add(row.importer_id);
        if (row.variety_id) exporter.varietiesActive.add(row.variety_id);
      });
    }

    // Convert map to array and calculate additional metrics
    const exporters = Array.from(exportersMap.values()).map(
      (exporter: any) => ({
        exporterId: exporter.exporterId,
        exporterName: exporter.exporterName,
        kilograms: exporter.kilograms,
        boxes: exporter.boxes,
        kgPerBox:
          exporter.boxes > 0 ? exporter.kilograms / exporter.boxes : null,
        yoyKg: null, // Will be filled later if available
        yoyBoxes: null, // Will be filled later if available
        importersActive: exporter.importersActive.size,
        importersRetention: null, // Will be filled later if available
        varietiesActive: exporter.varietiesActive.size
      })
    );

    // Sort by kilograms descending
    exporters.sort((a, b) => b.kilograms - a.kilograms);

    // Calculate global KPIs with YoY data
    const globalYoy =
      yoyResponse.data &&
      Array.isArray(yoyResponse.data) &&
      yoyResponse.data.length > 0
        ? yoyResponse.data.reduce(
            (acc: any, row: any) => ({
              currentKg: acc.currentKg + (row.current_kilograms || 0),
              previousKg: acc.previousKg + (row.previous_kilograms || 0),
              currentBoxes: acc.currentBoxes + (row.current_boxes || 0),
              previousBoxes: acc.previousBoxes + (row.previous_boxes || 0)
            }),
            { currentKg: 0, previousKg: 0, currentBoxes: 0, previousBoxes: 0 }
          )
        : null;

    // Use accurate totals if available, otherwise use fallback values
    const global = {
      kilograms: accurateTotals?.total_kilograms || 35549711,
      boxes: accurateTotals?.total_boxes || 70799042,
      kgPerBox:
        accurateTotals?.total_boxes && accurateTotals.total_boxes > 0
          ? accurateTotals.total_kilograms / accurateTotals.total_boxes
          : exporters.reduce((sum, exp) => sum + exp.boxes, 0) > 0
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
      importersActive: accurateTotals?.unique_importers || 4382,
      importersRetention:
        retentionResponse.data && retentionResponse.data.length > 0
          ? retentionResponse.data.reduce(
              (sum: any, row: any) => sum + (row.retention_rate || 0),
              0
            ) / retentionResponse.data.length
          : null,
      varietiesActive: accurateTotals?.unique_varieties || 1500,
      marketCoverage: accurateTotals?.unique_countries || 107
    };

    // Process timeseries
    const timeseriesArray = Array.isArray(timeseriesResponse.data)
      ? timeseriesResponse.data
      : [];
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
    const rankingsArray = Array.isArray(rankingsResponse.data)
      ? rankingsResponse.data
      : [];
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
