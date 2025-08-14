// Verify Supabase tables exist
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Checking Supabase Tables...\n');

  // Test basic connection first
  const { data: connectionTest, error: connectionError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(10);

  if (connectionError) {
    console.log('❌ Connection Error:', connectionError.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if your Supabase project is active');
    console.log('2. Verify the URL and API keys are correct');
    console.log('3. Check if RLS policies allow access');
    return;
  }

  console.log('✅ Connection successful!');
  console.log('📋 Available tables in public schema:');
  connectionTest?.forEach((table) => {
    console.log(`   - ${table.table_name}`);
  });

  // Check for our specific tables
  const requiredTables = ['products', 'kanban_columns', 'kanban_tasks'];
  const existingTables = connectionTest?.map((t) => t.table_name) || [];

  console.log('\n🎯 Required tables status:');
  requiredTables.forEach((tableName) => {
    const exists = existingTables.includes(tableName);
    console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
  });

  const missingTables = requiredTables.filter(
    (t) => !existingTables.includes(t)
  );

  if (missingTables.length > 0) {
    console.log('\n⚠️  Missing tables detected!');
    console.log('📝 You need to run the SQL script to create these tables:');
    missingTables.forEach((table) => console.log(`   - ${table}`));
    console.log(
      '\n🔗 Go to: https://app.supabase.com/project/gjwbenkkvivmfyghotzo/sql'
    );
    console.log('📋 Run the content of: supabase-setup.sql');
  } else {
    console.log('\n🎉 All required tables exist!');
  }
}

checkTables().catch(console.error);
