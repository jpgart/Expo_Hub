'use server';

import { createClient } from '@supabase/supabase-js';
import type {
  Filters,
  Kpi,
  ExporterKpi,
  Timeseries,
  TopItem,
  ExporterRanking,
  ExporterProfile,
  ChartData
} from '@/types/exporters';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to build WHERE clause from filters
function buildWhereClause(filters: Filters): string {
  const conditions: string[] = [];

  if (filters.seasonIds?.length) {
    conditions.push(`season_id IN (${filters.seasonIds.join(',')})`);
  }

  if (filters.exporterIds?.length) {
    conditions.push(`exporter_id IN (${filters.exporterIds.join(',')})`);
  }

  if (filters.speciesIds?.length) {
    conditions.push(`species_id IN (${filters.speciesIds.join(',')})`);
  }

  if (filters.varietyIds?.length) {
    conditions.push(`variety_id IN (${filters.varietyIds.join(',')})`);
  }

  if (filters.marketIds?.length) {
    conditions.push(`market_id IN (${filters.marketIds.join(',')})`);
  }

  if (filters.countryIds?.length) {
    conditions.push(`country_id IN (${filters.countryIds.join(',')})`);
  }

  if (filters.regionIds?.length) {
    conditions.push(`region_id IN (${filters.regionIds.join(',')})`);
  }

  if (filters.transportTypeIds?.length) {
    conditions.push(
      `transport_type_id IN (${filters.transportTypeIds.join(',')})`
    );
  }

  if (filters.weekFrom) {
    conditions.push(`etd_week >= '${filters.weekFrom}'`);
  }

  if (filters.weekTo) {
    conditions.push(`etd_week <= '${filters.weekTo}'`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

// Get KPIs for filtered data
export async function getExportersKPIs(
  filters: Filters
): Promise<{ global: Kpi; exporters: ExporterKpi[] }> {
  try {
    const whereClause = buildWhereClause(filters);

    // Get exporter KPIs
    const { data: exportersData, error: exportersError } = await supabase
      .from('unified_shipments')
      .select(
        `
        exporter_id,
        exporters!inner(name),
        kilograms,
        boxes,
        importer_id,
        variety_id
      `
      )
      .not('exporter_id', 'is', null);

    if (exportersError) throw exportersError;

    // Group by exporter
    const exporterMap = new Map();

    (exportersData || []).forEach((row: any) => {
      const exporterId = row.exporter_id;
      const exporterName = row.exporters?.name || 'Unknown';

      if (!exporterMap.has(exporterId)) {
        exporterMap.set(exporterId, {
          exporterId,
          exporterName,
          kilograms: 0,
          boxes: 0,
          importers: new Set(),
          varieties: new Set()
        });
      }

      const exporter = exporterMap.get(exporterId);
      exporter.kilograms += row.kilograms || 0;
      exporter.boxes += row.boxes || 0;
      if (row.importer_id) exporter.importers.add(row.importer_id);
      if (row.variety_id) exporter.varieties.add(row.variety_id);
    });

    const exporters: ExporterKpi[] = Array.from(exporterMap.values()).map(
      (exporter: any) => ({
        exporterId: exporter.exporterId,
        exporterName: exporter.exporterName,
        kilograms: exporter.kilograms,
        boxes: exporter.boxes,
        kgPerBox:
          exporter.boxes > 0 ? exporter.kilograms / exporter.boxes : null,
        yoyKg: null,
        yoyBoxes: null,
        importersActive: exporter.importers.size,
        importersRetention: null,
        varietiesActive: exporter.varieties.size
      })
    );

    // Calculate global KPIs
    const global: Kpi = {
      kilograms: exporters.reduce((sum, exp) => sum + exp.kilograms, 0),
      boxes: exporters.reduce((sum, exp) => sum + exp.boxes, 0),
      kgPerBox:
        exporters.reduce((sum, exp) => sum + exp.boxes, 0) > 0
          ? exporters.reduce((sum, exp) => sum + exp.kilograms, 0) /
            exporters.reduce((sum, exp) => sum + exp.boxes, 0)
          : null,
      yoyKg: null,
      yoyBoxes: null,
      importersActive: new Set(
        exporters.flatMap((exp) =>
          Array.from(
            { length: exp.importersActive },
            (_, i) => `${exp.exporterId}-${i}`
          )
        )
      ).size,
      importersRetention: null,
      varietiesActive: new Set(
        exporters.flatMap((exp) =>
          Array.from(
            { length: exp.varietiesActive },
            (_, i) => `${exp.exporterId}-${i}`
          )
        )
      ).size
    };

    return { global, exporters };
  } catch (error) {
    console.error('Error fetching exporters KPIs:', error);
    throw error;
  }
}

// Get timeseries data
export async function getExportersTimeseries(
  filters: Filters
): Promise<Timeseries> {
  try {
    const granularity = filters.granularity || 'week';
    let selectField: string;

    switch (granularity) {
      case 'week':
        selectField = 'etd_week';
        break;
      case 'month':
        selectField = 'SUBSTRING(etd_week, 1, 7)';
        break;
      case 'season':
        selectField = 'seasons.name';
        break;
      default:
        selectField = 'etd_week';
    }

    const { data, error } = await supabase
      .from('unified_shipments')
      .select(
        `
        ${selectField},
        kilograms,
        boxes,
        seasons!inner(name)
      `
      )
      .not('exporter_id', 'is', null);

    if (error) throw error;

    // Group by period
    const periodMap = new Map<string, { kilograms: number; boxes: number }>();

    (data || []).forEach((row: any) => {
      const period =
        granularity === 'season' ? row.seasons?.name : row[selectField];
      if (!period) return;

      const existing = periodMap.get(period);
      if (existing) {
        existing.kilograms += row.kilograms || 0;
        existing.boxes += row.boxes || 0;
      } else {
        periodMap.set(period, {
          kilograms: row.kilograms || 0,
          boxes: row.boxes || 0
        });
      }
    });

    return Array.from(periodMap.entries())
      .map(([period, data]) => ({
        period,
        kilograms: data.kilograms,
        boxes: data.boxes
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  } catch (error) {
    console.error('Error fetching exporters timeseries:', error);
    throw error;
  }
}

// Get top items by category
export async function getExportersTops(
  filters: Filters,
  topType: 'importers' | 'markets' | 'countries' | 'varieties' | 'arrival_ports'
): Promise<TopItem[]> {
  try {
    let joinTable: string;
    let joinField: string;
    let nameField: string;

    switch (topType) {
      case 'importers':
        joinTable = 'importers';
        joinField = 'importer_id';
        nameField = 'importers.name';
        break;
      case 'markets':
        joinTable = 'markets';
        joinField = 'market_id';
        nameField = 'markets.name';
        break;
      case 'countries':
        joinTable = 'countries';
        joinField = 'country_id';
        nameField = 'countries.name';
        break;
      case 'varieties':
        joinTable = 'varieties';
        joinField = 'variety_id';
        nameField = 'varieties.name';
        break;
      case 'arrival_ports':
        joinTable = 'arrival_ports';
        joinField = 'arrival_port_id';
        nameField = 'arrival_ports.name';
        break;
      default:
        throw new Error(`Invalid top type: ${topType}`);
    }

    const { data, error } = await supabase
      .from('unified_shipments')
      .select(
        `
        ${joinField},
        ${nameField},
        kilograms,
        boxes
      `
      )
      .not(joinField, 'is', null);

    if (error) throw error;

    // Group by item
    const itemMap = new Map<
      number,
      { name: string; kilograms: number; boxes: number }
    >();

    (data || []).forEach((row: any) => {
      const id = row[joinField];
      const name = row[nameField.split('.')[1]] || 'Unknown';

      const existing = itemMap.get(id);
      if (existing) {
        existing.kilograms += row.kilograms || 0;
        existing.boxes += row.boxes || 0;
      } else {
        itemMap.set(id, {
          name,
          kilograms: row.kilograms || 0,
          boxes: row.boxes || 0
        });
      }
    });

    // Calculate total for percentage
    const totalKg = Array.from(itemMap.values()).reduce(
      (sum, item) => sum + item.kilograms,
      0
    );

    return Array.from(itemMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        kilograms: data.kilograms,
        boxes: data.boxes,
        sharePct: totalKg > 0 ? (data.kilograms / totalKg) * 100 : 0
      }))
      .sort((a, b) => b.kilograms - a.kilograms)
      .slice(0, 10);
  } catch (error) {
    console.error(`Error fetching top ${topType}:`, error);
    throw error;
  }
}

// Get exporter rankings by season
export async function getExportersRankings(
  filters: Filters
): Promise<ExporterRanking[]> {
  try {
    const { data, error } = await supabase
      .from('unified_shipments')
      .select(
        `
        exporter_id,
        exporters!inner(name),
        season_id,
        seasons!inner(name),
        kilograms,
        boxes
      `
      )
      .not('exporter_id', 'is', null);

    if (error) throw error;

    // Group by exporter and season
    const rankingMap = new Map<
      string,
      {
        exporterId: number;
        exporterName: string;
        seasonId: number;
        seasonName: string;
        kilograms: number;
        boxes: number;
      }
    >();

    (data || []).forEach((row: any) => {
      const key = `${row.exporter_id}-${row.season_id}`;
      const existing = rankingMap.get(key);

      if (existing) {
        existing.kilograms += row.kilograms || 0;
        existing.boxes += row.boxes || 0;
      } else {
        rankingMap.set(key, {
          exporterId: row.exporter_id,
          exporterName: row.exporters?.name || 'Unknown',
          seasonId: row.season_id,
          seasonName: row.seasons?.name || 'Unknown',
          kilograms: row.kilograms || 0,
          boxes: row.boxes || 0
        });
      }
    });

    // Group by season and calculate rankings
    const seasonGroups = new Map<
      number,
      Array<{
        exporterId: number;
        exporterName: string;
        seasonId: number;
        seasonName: string;
        kilograms: number;
        boxes: number;
      }>
    >();

    Array.from(rankingMap.values()).forEach((item) => {
      if (!seasonGroups.has(item.seasonId)) {
        seasonGroups.set(item.seasonId, []);
      }
      seasonGroups.get(item.seasonId)!.push(item);
    });

    // Calculate rankings for each season
    const rankings: ExporterRanking[] = [];

    seasonGroups.forEach((exporters, seasonId) => {
      const sorted = exporters.sort((a, b) => b.kilograms - a.kilograms);
      sorted.forEach((exporter, index) => {
        rankings.push({
          exporterId: exporter.exporterId,
          exporterName: exporter.exporterName,
          seasonId: exporter.seasonId,
          seasonName: exporter.seasonName,
          kilograms: exporter.kilograms,
          boxes: exporter.boxes,
          rank: index + 1
        });
      });
    });

    return rankings.sort((a, b) => a.seasonId - b.seasonId || a.rank - b.rank);
  } catch (error) {
    console.error('Error fetching exporter rankings:', error);
    throw error;
  }
}

// Get complete chart data
export async function getExportersChartData(
  filters: Filters
): Promise<ChartData> {
  try {
    const [
      timeseries,
      topImporters,
      topMarkets,
      topCountries,
      topVarieties,
      transportSplit,
      arrivalPorts,
      rankings
    ] = await Promise.all([
      getExportersTimeseries(filters),
      getExportersTops(filters, 'importers'),
      getExportersTops(filters, 'markets'),
      getExportersTops(filters, 'countries'),
      getExportersTops(filters, 'varieties'),
      getExportersTops(filters, 'arrival_ports'),
      getExportersTops(filters, 'arrival_ports'),
      getExportersRankings(filters)
    ]);

    return {
      timeseries,
      topImporters,
      topMarkets,
      topCountries,
      topVarieties,
      transportSplit,
      arrivalPorts,
      rankings
    };
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
}

// Get exporter profile
export async function getExporterProfile(
  exporterId: number,
  filters: Filters
): Promise<ExporterProfile> {
  try {
    const whereClause = buildWhereClause({
      ...filters,
      exporterIds: [exporterId]
    });

    const query = `
      SELECT 
        e.id,
        e.name,
        SUM(s.kilograms) as total_kilograms,
        SUM(s.boxes) as total_boxes,
        COUNT(DISTINCT s.season_id) as seasons_active
      FROM (
        SELECT * FROM shipments_2024_2025
        UNION ALL SELECT * FROM shipments_2023_2024
        UNION ALL SELECT * FROM shipments_2022_2023
        UNION ALL SELECT * FROM shipments_2021_2022
      ) s
      JOIN exporters e ON s.exporter_id = e.id
      ${whereClause}
      GROUP BY e.id, e.name
    `;

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: query
    });

    if (error) throw error;

    const profile = data?.[0];
    if (!profile) {
      throw new Error('Exporter not found');
    }

    // Get top items for this exporter
    const [
      topMarkets,
      topCountries,
      topSpecies,
      topVarieties,
      topImporters,
      topArrivalPorts,
      transportSplit
    ] = await Promise.all([
      getExportersTops({ ...filters, exporterIds: [exporterId] }, 'markets'),
      getExportersTops({ ...filters, exporterIds: [exporterId] }, 'countries'),
      getExportersTops({ ...filters, exporterIds: [exporterId] }, 'varieties'),
      getExportersTops({ ...filters, exporterIds: [exporterId] }, 'varieties'),
      getExportersTops({ ...filters, exporterIds: [exporterId] }, 'importers'),
      getExportersTops(
        { ...filters, exporterIds: [exporterId] },
        'arrival_ports'
      ),
      getExportersTops(
        { ...filters, exporterIds: [exporterId] },
        'arrival_ports'
      )
    ]);

    return {
      id: profile.id,
      name: profile.name,
      totalKilograms: profile.total_kilograms || 0,
      totalBoxes: profile.total_boxes || 0,
      avgKgPerBox: profile.total_boxes
        ? profile.total_kilograms / profile.total_boxes
        : null,
      seasonsActive: profile.seasons_active || 0,
      topMarkets,
      topCountries,
      topSpecies,
      topVarieties,
      topImporters,
      topArrivalPorts,
      transportSplit
    };
  } catch (error) {
    console.error('Error fetching exporter profile:', error);
    throw error;
  }
}
