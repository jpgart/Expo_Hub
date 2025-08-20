import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Test basic connectivity
    const { data, error } = await supa
      .from('exporters')
      .select('id,name')
      .limit(3);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          details: error
        },
        { status: 500 }
      );
    }

    // Test materialized view
    const { data: mvData, error: mvError } = await supa
      .from('unified_shipments_mv')
      .select('season_id')
      .limit(1);

    // Test new optimized RPC functions with CORRECT parameters
    const { data: kpisData, error: kpisError } = await supa.rpc(
      'get_exporter_kpis',
      {
        p_season_ids: undefined,
        p_exporter_ids: undefined,
        p_species_ids: undefined,
        p_variety_ids: undefined,
        p_market_ids: undefined,
        p_country_ids: undefined,
        p_region_ids: undefined,
        p_transport_type_ids: undefined,
        p_week_from: undefined,
        p_week_to: undefined
      }
    );

    const { data: topsData, error: topsError } =
      await supa.rpc('get_exporter_tops');

    const { data: timeseriesData, error: timeseriesError } = await supa.rpc(
      'get_exporter_timeseries',
      {
        // REMOVED p_granularity - no longer exists in corrected function
        p_season_ids: undefined,
        p_exporter_ids: undefined,
        p_species_ids: undefined,
        p_variety_ids: undefined,
        p_market_ids: undefined,
        p_country_ids: undefined,
        p_region_ids: undefined,
        p_transport_type_ids: undefined,
        p_week_from: undefined,
        p_week_to: undefined
      }
    );

    return NextResponse.json({
      ok: true,
      sample: data,
      materializedView: {
        ok: !mvError,
        count: mvData?.length || 0
      },
      rpcTests: {
        get_exporter_kpis: kpisError
          ? { error: kpisError.message }
          : { ok: true, count: kpisData?.length || 0 },
        get_exporter_tops: topsError
          ? { error: topsError.message }
          : { ok: true, count: topsData?.length || 0 },
        get_exporter_timeseries: timeseriesError
          ? { error: timeseriesError.message }
          : { ok: true, count: timeseriesData?.length || 0 }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
