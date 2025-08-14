// Quick test with corrected variables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 Testing with corrected variables...\n');

console.log('Variables loaded:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  'ANON:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
);
console.log(
  'SERVICE:',
  process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing'
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test basic connection
const { data: regions, error } = await supabase
  .from('regions')
  .select('id, name')
  .limit(3);

if (error) {
  console.log('\n❌ Error:', error.message);
  console.log('Code:', error.code);
  console.log('Details:', error.details);
  console.log('Hint:', error.hint);
} else {
  console.log(`\n✅ Success! Found ${regions?.length || 0} regions`);
  regions?.forEach((r) => console.log(`   - ${r.name}`));
}
