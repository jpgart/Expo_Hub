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

    // Test the new get_filtered_totals function for cherries in season 2023-2024
    const filteredTotalsResponse = await supabase.rpc('get_filtered_totals', {
      p_season_ids: [3], // 2023-2024
      p_species_ids: [15] // CHERRIES
    });

    return NextResponse.json({
      testResults: {
        filteredTotals: filteredTotalsResponse.data || [],
        error: filteredTotalsResponse.error
      },
      expectedValues: {
        totalKg: 8209516,
        totalBoxes: 3584626,
        recordCount: 51307
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
