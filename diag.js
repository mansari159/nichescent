require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const r1 = await sb.from('products').select('id, name, primary_vibe_slug, fragrance_type').eq('is_active', true).limit(500)
  console.log('Error:', r1.error?.message)
  console.log('Rows returned:', r1.data?.length)
  if (r1.data && r1.data.length > 0) {
    const tagged   = r1.data.filter(p => p.primary_vibe_slug)
    const untagged = r1.data.filter(p => !p.primary_vibe_slug)
    console.log('Tagged:', tagged.length, '| Untagged:', untagged.length)
    console.log('\nSample untagged (first 30):')
    untagged.slice(0, 30).forEach(p => console.log(' -', p.name, '|', p.fragrance_type))
  }
  
  // Check for non-fragrances
  const r2 = await sb.from('products').select('name, fragrance_type').eq('is_active', true)
    .or('name.ilike.%body wash%,name.ilike.%lotion%,name.ilike.%gift set%,name.ilike.%shower gel%,name.ilike.%hair%,name.ilike.%candle%,name.ilike.%burner%')
    .limit(50)
  console.log('\nPotential non-fragrance items (' + (r2.data?.length || 0) + '):')
  r2.data?.forEach(p => console.log(' -', p.name))
}
run().catch(console.error)
