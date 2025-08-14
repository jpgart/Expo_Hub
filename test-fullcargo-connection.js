// Test FullCargo Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFullCargoData() {
  console.log('🚢 Testing FullCargo Data Connection...\n');

  try {
    // Test 1: Check regions
    console.log('🌍 Testing Regions:');
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('id, name')
      .limit(5);

    if (regionsError) {
      console.log('❌ Regions Error:', regionsError.message);
    } else {
      console.log(`✅ Regions found: ${regions?.length || 0}`);
      regions?.forEach((r) => console.log(`   - ${r.name}`));
    }

    // Test 2: Check species
    console.log('\n🌱 Testing Species:');
    const { data: species, error: speciesError } = await supabase
      .from('species')
      .select('id, name')
      .limit(5);

    if (speciesError) {
      console.log('❌ Species Error:', speciesError.message);
    } else {
      console.log(`✅ Species found: ${species?.length || 0}`);
      species?.forEach((s) => console.log(`   - ${s.name}`));
    }

    // Test 3: Check latest season shipments
    console.log('\n📦 Testing Shipments (2024-2025):');
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments_2024_2025')
      .select('id, boxes, kilograms, etd_week')
      .not('boxes', 'is', null)
      .limit(3);

    if (shipmentsError) {
      console.log('❌ Shipments Error:', shipmentsError.message);
    } else {
      console.log(`✅ Shipments found: ${shipments?.length || 0}`);
      shipments?.forEach((s) =>
        console.log(
          `   - Week ${s.etd_week}: ${s.boxes} boxes, ${s.kilograms} kg`
        )
      );
    }

    // Test 4: Check total records
    console.log('\n📊 Testing Record Counts:');
    const tables = [
      'regions',
      'species',
      'varieties',
      'importers',
      'exporters'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records`);
      }
    }

    console.log('\n🎉 FullCargo Connection Test Complete!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testFullCargoData();
