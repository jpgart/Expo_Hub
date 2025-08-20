import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if Supabase environment variables are available and valid
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_');

const supabase = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    // Test 1: Direct query to unified_shipments for cherries in season 2023-2024
    const directQuery = await supabase
      .from('unified_shipments')
      .select('*')
      .eq('season_id', 3) // 2023-2024
      .eq('species_id', 15); // CHERRIES

    // Test 2: Use the RPC function with the same filters
    const rpcQuery = await supabase.rpc('get_exporter_kpis', {
      p_season_ids: [3], // 2023-2024
      p_species_ids: [15] // CHERRIES
    });

    // Test 3: Count total records for cherries in 2023-2024
    const countQuery = await supabase
      .from('unified_shipments')
      .select('*', { count: 'exact', head: true })
      .eq('season_id', 3)
      .eq('species_id', 15);

    // Test 4: Sum totals for cherries in 2023-2024
    const sumQuery = await supabase
      .from('unified_shipments')
      .select('kilograms, boxes')
      .eq('season_id', 3)
      .eq('species_id', 15);

    // Calculate totals from sum query
    const totalKg =
      sumQuery.data?.reduce((sum, row) => sum + (row.kilograms || 0), 0) || 0;
    const totalBoxes =
      sumQuery.data?.reduce((sum, row) => sum + (row.boxes || 0), 0) || 0;

    return NextResponse.json({
      testResults: {
        directQueryCount: directQuery.data?.length || 0,
        rpcQueryCount: rpcQuery.data?.length || 0,
        countQueryResult: countQuery.count || 0,
        sumQueryCount: sumQuery.data?.length || 0,
        calculatedTotals: {
          totalKg,
          totalBoxes,
          avgKgPerBox: totalBoxes > 0 ? totalKg / totalBoxes : 0
        }
      },
      sampleData: {
        directQuerySample: directQuery.data?.slice(0, 3) || [],
        rpcQuerySample: rpcQuery.data?.slice(0, 3) || []
      },
      errors: {
        directQueryError: directQuery.error,
        rpcQueryError: rpcQuery.error,
        countQueryError: countQuery.error,
        sumQueryError: sumQuery.error
      }
    });
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
