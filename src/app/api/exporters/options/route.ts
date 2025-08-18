import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET() {
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
    // Fetch all filter options in parallel
    const [
      seasons,
      exporters,
      species,
      varieties,
      markets,
      countries,
      regions,
      transportTypes,
      arrivalPorts
    ] = await Promise.all([
      supabase.from('seasons').select('id, name').order('name'),
      supabase.from('exporters').select('id, name').order('name'),
      supabase.from('species').select('id, name').order('name'),
      supabase.from('varieties').select('id, name').order('name'),
      supabase.from('markets').select('id, name').order('name'),
      supabase.from('countries').select('id, name').order('name'),
      supabase.from('regions').select('id, name').order('name'),
      supabase.from('transport_types').select('id, name').order('name'),
      supabase.from('arrival_ports').select('id, name').order('name')
    ]);

    return NextResponse.json({
      seasons: seasons.data || [],
      exporters: exporters.data || [],
      species: species.data || [],
      varieties: varieties.data || [],
      markets: markets.data || [],
      countries: countries.data || [],
      regions: regions.data || [],
      transportTypes: transportTypes.data || [],
      arrivalPorts: arrivalPorts.data || []
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
