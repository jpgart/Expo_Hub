// Quick test to verify Supabase connection and data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection and Data...\n');

  try {
    // Test 1: Check products table
    console.log('📦 Testing Products Table:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category')
      .limit(3);

    if (productsError) {
      console.log('❌ Products Error:', productsError.message);
    } else {
      console.log(`✅ Products found: ${products?.length || 0}`);
      products?.forEach((p) => console.log(`   - ${p.name} (${p.category})`));
    }

    // Test 2: Check kanban_columns table
    console.log('\n📋 Testing Kanban Columns Table:');
    const { data: columns, error: columnsError } = await supabase
      .from('kanban_columns')
      .select('id, title, position')
      .order('position');

    if (columnsError) {
      console.log('❌ Columns Error:', columnsError.message);
    } else {
      console.log(`✅ Columns found: ${columns?.length || 0}`);
      columns?.forEach((c) =>
        console.log(`   - ${c.title} (pos: ${c.position})`)
      );
    }

    // Test 3: Check kanban_tasks table
    console.log('\n📝 Testing Kanban Tasks Table:');
    const { data: tasks, error: tasksError } = await supabase
      .from('kanban_tasks')
      .select('id, title, status')
      .limit(3);

    if (tasksError) {
      console.log('❌ Tasks Error:', tasksError.message);
    } else {
      console.log(`✅ Tasks found: ${tasks?.length || 0}`);
      tasks?.forEach((t) => console.log(`   - ${t.title} (${t.status})`));
    }

    console.log('\n🎉 Connection Test Complete!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testSupabaseConnection();
