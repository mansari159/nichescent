// ISO 2-letter code → flag emoji
const FLAG_MAP: Record<string, string> = {
  AE: '🇦🇪', SA: '🇸🇦', KW: '🇰🇼', OM: '🇴🇲', QA: '🇶🇦', BH: '🇧🇭', JO: '🇯🇴',
  EG: '🇪🇬', MA: '🇲🇦', LB: '🇱🇧', SY: '🇸🇾', IQ: '🇮🇶', IR: '🇮🇷',
  IN: '🇮🇳', PK: '🇵🇰', BD: '🇧🇩',
  FR: '🇫🇷', GB: '🇬🇧', DE: '🇩🇪', IT: '🇮🇹', NL: '🇳🇱', CH: '🇨🇭',
  US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺',
  JP: '🇯🇵', CN: '🇨🇳', KR: '🇰🇷',
  ID: '🇮🇩', MY: '🇲🇾', TH: '🇹🇭', SG: '🇸🇬',
  TR: '🇹🇷', RU: '🇷🇺',
}

const NAME_MAP: Record<string, string> = {
  AE: 'UAE', SA: 'Saudi Arabia', KW: 'Kuwait', OM: 'Oman', QA: 'Qatar',
  BH: 'Bahrain', JO: 'Jordan', EG: 'Egypt', MA: 'Morocco', LB: 'Lebanon',
  SY: 'Syria', IQ: 'Iraq', IR: 'Iran', IN: 'India', PK: 'Pakistan',
  BD: 'Bangladesh', FR: 'France', GB: 'United Kingdom', DE: 'Germany',
  IT: 'Italy', NL: 'Netherlands', CH: 'Switzerland', US: 'United States',
  CA: 'Canada', AU: 'Australia', JP: 'Japan', CN: 'China', KR: 'South Korea',
  ID: 'Indonesia', MY: 'Malaysia', TH: 'Thailand', SG: 'Singapore',
  TR: 'Turkey', RU: 'Russia',
}

export function getCountryFlag(code: string | null | undefined): string {
  if (!code) return ''
  return FLAG_MAP[code.toUpperCase()] ?? ''
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return ''
  return NAME_MAP[code.toUpperCase()] ?? code
}

export function getCountrySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export const REGIONS = [
  'Middle East',
  'South Asia',
  'Europe',
  'Southeast Asia',
  'North America',
  'East Asia',
  'Other',
]
