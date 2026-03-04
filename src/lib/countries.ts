/**
 * Country code → display info lookup
 * Static map — no DB call needed anywhere in the UI.
 * country codes are stored as CHAR(2) in brands.country (e.g. 'AE', 'SA')
 */

export interface CountryInfo {
  name: string
  flag: string
  region: string
}

export const COUNTRY_MAP: Record<string, CountryInfo> = {
  // ── Middle East ──────────────────────────────────────────
  SA: { name: 'Saudi Arabia',         flag: '🇸🇦', region: 'Middle East' },
  AE: { name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East' },
  KW: { name: 'Kuwait',               flag: '🇰🇼', region: 'Middle East' },
  OM: { name: 'Oman',                 flag: '🇴🇲', region: 'Middle East' },
  QA: { name: 'Qatar',                flag: '🇶🇦', region: 'Middle East' },
  BH: { name: 'Bahrain',              flag: '🇧🇭', region: 'Middle East' },
  EG: { name: 'Egypt',                flag: '🇪🇬', region: 'Middle East' },
  MA: { name: 'Morocco',              flag: '🇲🇦', region: 'Middle East' },
  JO: { name: 'Jordan',               flag: '🇯🇴', region: 'Middle East' },
  LB: { name: 'Lebanon',              flag: '🇱🇧', region: 'Middle East' },
  PS: { name: 'Palestine',            flag: '🇵🇸', region: 'Middle East' },
  IQ: { name: 'Iraq',                 flag: '🇮🇶', region: 'Middle East' },
  IR: { name: 'Iran',                 flag: '🇮🇷', region: 'Middle East' },
  TR: { name: 'Turkey',               flag: '🇹🇷', region: 'Middle East' },
  DZ: { name: 'Algeria',              flag: '🇩🇿', region: 'Middle East' },
  TN: { name: 'Tunisia',              flag: '🇹🇳', region: 'Middle East' },
  LY: { name: 'Libya',                flag: '🇱🇾', region: 'Middle East' },
  SY: { name: 'Syria',                flag: '🇸🇾', region: 'Middle East' },
  YE: { name: 'Yemen',                flag: '🇾🇪', region: 'Middle East' },
  // ── South Asia ───────────────────────────────────────────
  IN: { name: 'India',                flag: '🇮🇳', region: 'South Asia' },
  PK: { name: 'Pakistan',             flag: '🇵🇰', region: 'South Asia' },
  BD: { name: 'Bangladesh',           flag: '🇧🇩', region: 'South Asia' },
  LK: { name: 'Sri Lanka',            flag: '🇱🇰', region: 'South Asia' },
  NP: { name: 'Nepal',                flag: '🇳🇵', region: 'South Asia' },
  // ── Southeast Asia ───────────────────────────────────────
  ID: { name: 'Indonesia',            flag: '🇮🇩', region: 'Southeast Asia' },
  MY: { name: 'Malaysia',             flag: '🇲🇾', region: 'Southeast Asia' },
  TH: { name: 'Thailand',             flag: '🇹🇭', region: 'Southeast Asia' },
  SG: { name: 'Singapore',            flag: '🇸🇬', region: 'Southeast Asia' },
  PH: { name: 'Philippines',          flag: '🇵🇭', region: 'Southeast Asia' },
  VN: { name: 'Vietnam',              flag: '🇻🇳', region: 'Southeast Asia' },
  // ── East Asia ────────────────────────────────────────────
  JP: { name: 'Japan',                flag: '🇯🇵', region: 'East Asia' },
  KR: { name: 'South Korea',          flag: '🇰🇷', region: 'East Asia' },
  CN: { name: 'China',                flag: '🇨🇳', region: 'East Asia' },
  // ── Europe ───────────────────────────────────────────────
  FR: { name: 'France',               flag: '🇫🇷', region: 'Europe' },
  IT: { name: 'Italy',                flag: '🇮🇹', region: 'Europe' },
  GB: { name: 'United Kingdom',       flag: '🇬🇧', region: 'Europe' },
  DE: { name: 'Germany',              flag: '🇩🇪', region: 'Europe' },
  ES: { name: 'Spain',                flag: '🇪🇸', region: 'Europe' },
  CH: { name: 'Switzerland',          flag: '🇨🇭', region: 'Europe' },
  NL: { name: 'Netherlands',          flag: '🇳🇱', region: 'Europe' },
  SE: { name: 'Sweden',               flag: '🇸🇪', region: 'Europe' },
  DK: { name: 'Denmark',              flag: '🇩🇰', region: 'Europe' },
  BE: { name: 'Belgium',              flag: '🇧🇪', region: 'Europe' },
  PL: { name: 'Poland',               flag: '🇵🇱', region: 'Europe' },
  PT: { name: 'Portugal',             flag: '🇵🇹', region: 'Europe' },
  AT: { name: 'Austria',              flag: '🇦🇹', region: 'Europe' },
  NO: { name: 'Norway',               flag: '🇳🇴', region: 'Europe' },
  FI: { name: 'Finland',              flag: '🇫🇮', region: 'Europe' },
  // ── Americas ─────────────────────────────────────────────
  US: { name: 'United States',        flag: '🇺🇸', region: 'Americas' },
  CA: { name: 'Canada',               flag: '🇨🇦', region: 'Americas' },
  BR: { name: 'Brazil',               flag: '🇧🇷', region: 'Americas' },
  MX: { name: 'Mexico',               flag: '🇲🇽', region: 'Americas' },
  AR: { name: 'Argentina',            flag: '🇦🇷', region: 'Americas' },
  // ── Oceania ──────────────────────────────────────────────
  AU: { name: 'Australia',            flag: '🇦🇺', region: 'Oceania' },
  NZ: { name: 'New Zealand',          flag: '🇳🇿', region: 'Oceania' },
  // ── Africa ───────────────────────────────────────────────
  ZA: { name: 'South Africa',         flag: '🇿🇦', region: 'Africa' },
  NG: { name: 'Nigeria',              flag: '🇳🇬', region: 'Africa' },
  KE: { name: 'Kenya',                flag: '🇰🇪', region: 'Africa' },
  ET: { name: 'Ethiopia',             flag: '🇪🇹', region: 'Africa' },
}

/** Get the flag emoji for a country code (e.g. 'AE' → '🇦🇪') */
export function getCountryFlag(code: string | null | undefined): string {
  if (!code) return ''
  return COUNTRY_MAP[code.toUpperCase()]?.flag ?? ''
}

/** Get the full country name for a country code (e.g. 'AE' → 'United Arab Emirates') */
export function getCountryName(code: string | null | undefined): string {
  if (!code) return ''
  return COUNTRY_MAP[code.toUpperCase()]?.name ?? code
}

/** Get the region for a country code (e.g. 'AE' → 'Middle East') */
export function getCountryRegion(code: string | null | undefined): string {
  if (!code) return ''
  return COUNTRY_MAP[code.toUpperCase()]?.region ?? ''
}

/** Get full country info object, or null if not found */
export function getCountryInfo(code: string | null | undefined): CountryInfo | null {
  if (!code) return null
  return COUNTRY_MAP[code.toUpperCase()] ?? null
}

/** Format for display: flag + name, e.g. '🇦🇪 United Arab Emirates' */
export function formatCountry(code: string | null | undefined): string {
  const info = getCountryInfo(code)
  if (!info) return code ?? ''
  return `${info.flag} ${info.name}`
}
