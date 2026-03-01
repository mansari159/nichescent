import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const { data } = await supabase
    .from('products')
    .select('name, slug, brand:brands(name)')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .limit(8)

  const suggestions = (data ?? []).map(p => ({
    label: `${p.name}${p.brand ? ` — ${(p.brand as { name: string }).name}` : ''}`,
    slug: p.slug,
  }))

  return NextResponse.json({ suggestions })
}
