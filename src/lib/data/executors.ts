import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function execPlan(plan: any) {
  const { intent, filters, params } = plan;

  try {
    switch (intent) {
      case 'kpis':
        return await execKPIs(filters, params);
      case 'timeseries':
        return await execTimeseries(filters, params);
      case 'tops':
        return await execTops(filters, params);
      case 'rankings':
        return await execRankings(filters, params);
      case 'search':
        return await execSearch(filters, params);
      default:
        return { kind: 'error', data: [], error: 'Unknown intent' };
    }
  } catch (error) {
    console.error('❌ Error executing plan:', error);
    return { kind: 'error', data: [], error: String(error) };
  }
}

async function execKPIs(filters: any, params: any) {
  try {
    const { data, error } = await supabase.rpc('get_exporter_kpis', {
      p_season_ids: filters?.seasonIds || null,
      p_exporter_ids: filters?.exporterIds || null,
      p_species_ids: filters?.speciesIds || null,
      p_variety_ids: filters?.varietyIds || null,
      p_market_ids: filters?.marketIds || null,
      p_country_ids: filters?.countryIds || null,
      p_region_ids: filters?.regionIds || null,
      p_transport_type_ids: filters?.transportTypeIds || null,
      p_week_from: filters?.weekFrom || null,
      p_week_to: filters?.weekTo || null
    });

    if (error) throw error;

    return {
      kind: 'kpis',
      data: data || [],
      params
    };
  } catch (error) {
    console.error('❌ Error in execKPIs:', error);
    return { kind: 'error', data: [], error: String(error) };
  }
}

async function execTimeseries(filters: any, params: any) {
  try {
    const { data, error } = await supabase.rpc('get_exporter_timeseries', {
      p_season_ids: filters?.seasonIds || null,
      p_exporter_ids: filters?.exporterIds || null,
      p_species_ids: filters?.speciesIds || null,
      p_variety_ids: filters?.varietyIds || null,
      p_market_ids: filters?.marketIds || null,
      p_country_ids: filters?.countryIds || null,
      p_region_ids: filters?.regionIds || null,
      p_transport_type_ids: filters?.transportTypeIds || null,
      p_week_from: filters?.weekFrom || null,
      p_week_to: filters?.weekTo || null
    });

    if (error) throw error;

    return {
      kind: 'timeseries',
      data: data || [],
      params
    };
  } catch (error) {
    console.error('❌ Error in execTimeseries:', error);
    return { kind: 'error', data: [], error: String(error) };
  }
}

async function execTops(filters: any, params: any) {
  try {
    // Función ultra-simple sin parámetros
    const { data, error } = await supabase.rpc('get_exporter_tops');

    if (error) throw error;

    return {
      kind: 'tops',
      data: data || [],
      params
    };
  } catch (error) {
    console.error('❌ Error in execTops:', error);
    return { kind: 'error', data: [], error: String(error) };
  }
}

async function execRankings(filters: any, params: any) {
  try {
    // Por ahora, usar la función tops para rankings
    const { data, error } = await supabase.rpc('get_exporter_tops', {
      p_top_type: 'exporters',
      p_season_ids: filters?.seasonIds || null,
      p_exporter_ids: filters?.exporterIds || null,
      p_species_ids: filters?.speciesIds || null,
      p_variety_ids: filters?.varietyIds || null,
      p_market_ids: filters?.marketIds || null,
      p_country_ids: filters?.countryIds || null,
      p_region_ids: filters?.regionIds || null,
      p_transport_type_ids: filters?.transportTypeIds || null,
      p_week_from: filters?.weekFrom || null,
      p_week_to: filters?.weekTo || null
    });

    if (error) throw error;

    return {
      kind: 'rankings',
      data: data || [],
      params
    };
  } catch (error) {
    console.error('❌ Error in execRankings:', error);
    return { kind: 'error', data: [], error: String(error) };
  }
}

async function execSearch(filters: any, params: any) {
  try {
    const searchTerm = params?.search_term;

    if (!searchTerm) {
      return { kind: 'error', data: [], error: 'No search term provided' };
    }

    console.log('🔍 Searching for:', searchTerm);

    // Buscar exportador por nombre
    const { data: exporterData, error: exporterError } = await supabase
      .from('exporters')
      .select('id, name')
      .ilike('name', `%${searchTerm}%`)
      .limit(5);

    if (exporterError) throw exporterError;

    console.log('🔍 Exporter data:', exporterData);

    if (!exporterData || exporterData.length === 0) {
      return {
        kind: 'search',
        data: [],
        params,
        message: `No se encontró ningún exportador con el nombre "${searchTerm}"`
      };
    }

    // Obtener datos específicos del exportador encontrado
    const exporterIds = exporterData.map((e) => e.id);

    // Primero, buscar datos básicos en la vista materializada
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('unified_shipments_mv')
      .select('*')
      .in('exporter_id', exporterIds);

    if (shipmentError) throw shipmentError;

    console.log('🔍 Shipment data count:', shipmentData?.length);

    if (!shipmentData || shipmentData.length === 0) {
      return {
        kind: 'search',
        data: [],
        params,
        message: `No se encontraron datos de exportación para "${searchTerm}"`
      };
    }

    // Calcular KPIs básicos del exportador
    const totalKilograms = shipmentData.reduce(
      (sum, item) => sum + (item.kilograms || 0),
      0
    );
    const totalBoxes = shipmentData.reduce(
      (sum, item) => sum + (item.boxes || 0),
      0
    );

    // Obtener información básica
    const seasons = Array.from(
      new Set(shipmentData.map((item) => item.season_id))
    );
    const markets = Array.from(
      new Set(shipmentData.map((item) => item.market_id))
    );
    const species = Array.from(
      new Set(shipmentData.map((item) => item.species_id))
    );
    const weeks = Array.from(
      new Set(shipmentData.map((item) => item.etd_week))
    ).sort();

    // Obtener nombres de las entidades relacionadas
    const { data: seasonNames } = await supabase
      .from('seasons')
      .select('id, name')
      .in('id', seasons);

    const { data: marketNames } = await supabase
      .from('markets')
      .select('id, name')
      .in('id', markets);

    const { data: speciesNames } = await supabase
      .from('species')
      .select('id, name')
      .in('id', species);

    // Crear mapeos
    const seasonMap: Record<number, string> = {};
    seasonNames?.forEach((s) => (seasonMap[s.id] = s.name));
    const marketMap: Record<number, string> = {};
    marketNames?.forEach((m) => (marketMap[m.id] = m.name));
    const speciesMap: Record<number, string> = {};
    speciesNames?.forEach((sp) => (speciesMap[sp.id] = sp.name));

    // Agrupar datos por especie
    const speciesData: Record<string, { kilograms: number; boxes: number }> =
      {};
    shipmentData.forEach((item) => {
      const speciesName =
        speciesMap[item.species_id] || `ID: ${item.species_id}`;
      if (!speciesData[speciesName]) {
        speciesData[speciesName] = { kilograms: 0, boxes: 0 };
      }
      speciesData[speciesName].kilograms += item.kilograms || 0;
      speciesData[speciesName].boxes += item.boxes || 0;
    });

    // Agrupar datos por mercado
    const marketData: Record<string, { kilograms: number; boxes: number }> = {};
    shipmentData.forEach((item) => {
      const marketName = marketMap[item.market_id] || `ID: ${item.market_id}`;
      if (!marketData[marketName]) {
        marketData[marketName] = { kilograms: 0, boxes: 0 };
      }
      marketData[marketName].kilograms += item.kilograms || 0;
      marketData[marketName].boxes += item.boxes || 0;
    });

    const result = {
      exporter: exporterData[0],
      summary: {
        total_kilograms: totalKilograms,
        total_boxes: totalBoxes,
        seasons: seasons.map((id) => seasonMap[id] || `ID: ${id}`),
        markets_count: markets.length,
        species_count: species.length,
        weeks: weeks
      },
      by_species: speciesData,
      by_market: marketData,
      shipments: shipmentData
    };

    console.log('🔍 Search result:', result);

    return {
      kind: 'search',
      data: result,
      params
    };
  } catch (error) {
    console.error('❌ Error in execSearch:', error);
    return { kind: 'error', data: [], error: String(error) };
  }
}
