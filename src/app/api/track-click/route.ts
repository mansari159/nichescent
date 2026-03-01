import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, retailerId, sourcePage, searchQuery } = body

    if (!productId || !retailerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Insert click event (fire-and-forget — don't block the redirect)
    await supabase.from('click_events').insert({
      product_id: productId,
      retailer_id: retailerId,
      source_page: sourcePage ?? 'product',
      search_query: searchQuery ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Track click error:', err)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
