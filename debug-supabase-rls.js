// Debug RLS policies and data access
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Test with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test with anon key (subject to RLS)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugRLS() {
  console.log('🔍 Debugging Supabase RLS and Data Access...\n');

  try {
    // Test 1: Check with service role (should bypass RLS)
    console.log('🔑 Testing with Service Role (Admin):');
    const { data: adminRegions, error: adminError } = await supabaseAdmin
      .from('regions')
      .select('id, name')
      .limit(5);

    if (adminError) {
      console.log('❌ Admin Error:', adminError.message);
    } else {
      console.log(`✅ Admin found: ${adminRegions?.length || 0} regions`);
      adminRegions?.forEach((r) => console.log(`   - ${r.name}`));
    }

    // Test 2: Check with anon key (subject to RLS)
    console.log('\n🔓 Testing with Anon Key (RLS Applied):');
    const { data: anonRegions, error: anonError } = await supabaseAnon
      .from('regions')
      .select('id, name')
      .limit(5);

    if (anonError) {
      console.log('❌ Anon Error:', anonError.message);
      console.log('   This might be due to RLS policies blocking access');
    } else {
      console.log(`✅ Anon found: ${anonRegions?.length || 0} regions`);
      anonRegions?.forEach((r) => console.log(`   - ${r.name}`));
    }

    // Test 3: Check if tables exist at all
    console.log('\n📋 Testing Table Existence:');
    const { data: tables, error: tablesError } =
      await supabaseAdmin.rpc('get_table_list'); // This might not work, but let's try

    if (tablesError) {
      console.log('⚠️  Cannot check table list via RPC');

      // Alternative: try to access each table directly
      const testTables = [
        'regions',
        'species',
        'varieties',
        'shipments_2024_2025'
      ];
      for (const table of testTables) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('id')
          .limit(1);

        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(
            `✅ Table '${table}': Exists (${data?.length || 0} sample records)`
          );
        }
      }
    }

    console.log('\n💡 Recommendations:');
    console.log('==================');

    if (adminRegions && adminRegions.length === 0) {
      console.log(
        '📝 Tables exist but are empty - you need to load your CSV data'
      );
      console.log(
        '🔗 Use Supabase Dashboard → Table Editor to import your CSV files'
      );
    } else if (
      adminRegions &&
      adminRegions.length > 0 &&
      (!anonRegions || anonRegions.length === 0)
    ) {
      console.log('🔒 Data exists but RLS is blocking access');
      console.log(
        '🔧 You need to update RLS policies to allow public access or configure Clerk JWT'
      );
    } else if (
      adminRegions &&
      adminRegions.length > 0 &&
      anonRegions &&
      anonRegions.length > 0
    ) {
      console.log('🎉 Everything looks good! Data is accessible');
    }
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugRLS();
