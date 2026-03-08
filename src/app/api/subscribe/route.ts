import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid email address.' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('email_subscribers')
      .upsert(
        { email: email.trim().toLowerCase(), source: source ?? 'unknown' },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (error) {
      console.error('Subscribe DB error:', error)
      return NextResponse.json({ success: false, error: 'Could not save your email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 })
  }
}
