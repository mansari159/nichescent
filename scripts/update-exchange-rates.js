/**
 * Exchange rate updater
 * Run daily via GitHub Actions cron: node scripts/update-exchange-rates.js
 *
 * Uses exchangerate-api.com free tier (1500 requests/month)
 * Set EXCHANGE_RATE_API_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Currencies used by MENA fragrance retailers
const CURRENCIES = ['AED', 'SAR', 'KWD', 'BHD', 'OMR', 'QAR', 'EUR', 'GBP', 'INR']

async function main() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY

  if (!apiKey) {
    console.log('No EXCHANGE_RATE_API_KEY set — using hardcoded fallback rates')
    await upsertRates({
      AED: 0.2723, SAR: 0.2667, EUR: 1.0850,
      GBP: 1.2700, KWD: 3.2500, BHD: 2.6525,
      OMR: 2.5974, QAR: 0.2747, INR: 0.0119,
    })
    return
  }

  console.log('Fetching exchange rates from exchangerate-api.com...')

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
  const { data } = await axios.get(url, { timeout: 10_000 })

  if (data.result !== 'success') {
    throw new Error(`API error: ${data['error-type']}`)
  }

  // API returns rates relative to USD (e.g., 1 USD = 3.67 AED)
  // We need the inverse (1 AED = 0.272 USD)
  const rates = {}
  for (const currency of CURRENCIES) {
    const ratePerUSD = data.conversion_rates[currency]
    if (ratePerUSD) {
      rates[currency] = Math.round((1 / ratePerUSD) * 1_000_000) / 1_000_000
    }
  }

  await upsertRates(rates)
}

async function upsertRates(rates) {
  const rows = Object.entries(rates).map(([from_currency, rate]) => ({
    from_currency,
    to_currency: 'USD',
    rate,
    fetched_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('exchange_rates')
    .upsert(rows, { onConflict: 'from_currency,to_currency' })

  if (error) throw error

  console.log(`✓ Updated ${rows.length} exchange rates:`)
  rows.forEach(r => console.log(`  1 ${r.from_currency} = $${r.rate} USD`))
}

main().catch(err => {
  console.error('Failed to update exchange rates:', err.message)
  process.exit(1)
})
