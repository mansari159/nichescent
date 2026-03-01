import { supabase } from './supabase'

// Cached rates so we don't hit DB on every request
let ratesCache: Record<string, number> = {}
let cacheTime = 0

export async function getExchangeRates(): Promise<Record<string, number>> {
  // Cache for 1 hour
  if (Date.now() - cacheTime < 3_600_000 && Object.keys(ratesCache).length) {
    return ratesCache
  }

  const { data } = await supabase
    .from('exchange_rates')
    .select('from_currency, rate')

  if (data) {
    ratesCache = Object.fromEntries(data.map(r => [r.from_currency, r.rate]))
    cacheTime = Date.now()
  }

  // Fallback approximate rates if DB is empty
  if (!Object.keys(ratesCache).length) {
    ratesCache = {
      AED: 0.2723, SAR: 0.2667, EUR: 1.0850,
      GBP: 1.2700, KWD: 3.2500, BHD: 2.6525,
      OMR: 2.5974, QAR: 0.2747, INR: 0.0119,
    }
  }

  return ratesCache
}

export async function convertToUSD(amount: number, from: string): Promise<number> {
  if (from === 'USD') return amount
  const rates = await getExchangeRates()
  const rate = rates[from]
  if (!rate) return amount
  return Math.round(amount * rate * 100) / 100
}
