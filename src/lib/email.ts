'use server'

import { createServerClient } from '@/lib/supabase'

export async function subscribeEmail(email: string, source: string = 'unknown'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('email_subscribers')
      .upsert({ email: email.trim().toLowerCase(), source }, { onConflict: 'email', ignoreDuplicates: true })

    if (error) {
      console.error('Subscribe error:', error)
      return { success: false, error: 'Could not save your email. Please try again.' }
    }
    return { success: true }
  } catch (err) {
    console.error('Subscribe exception:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
