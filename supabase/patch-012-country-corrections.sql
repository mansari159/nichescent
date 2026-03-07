-- patch-012-country-corrections.sql
-- Comprehensive country corrections based on brand origin research.
-- Many brands previously assigned SA (Saudi) are actually UAE or other origins.
-- Run AFTER patch-010 and patch-011.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── UAE (AE) corrections ──────────────────────────────────────────────────────
-- These were incorrectly assigned SA but are Dubai/UAE-based operations

-- Swiss Arabian: founded Dubai 1974 — AE
UPDATE brands SET country = 'AE'
WHERE (slug = 'swiss-arabian' OR LOWER(name) LIKE '%swiss arabian%')
  AND country != 'AE';

-- Al Haramain: main office Dubai, UAE (though origin historically Saudi)
-- The trading company is UAE-registered and operates from Dubai
UPDATE brands SET country = 'AE'
WHERE (slug IN ('al-haramain', 'al-haramain-perfumes') OR LOWER(name) LIKE '%al haramain%')
  AND country != 'AE';

-- Nabeel Perfumes: Dubai-based, UAE
UPDATE brands SET country = 'AE'
WHERE (slug IN ('nabeel', 'nabeel-perfumes') OR LOWER(name) LIKE '%nabeel%')
  AND country != 'AE';

-- Lattafa: Dubai, UAE
UPDATE brands SET country = 'AE'
WHERE (slug IN ('lattafa', 'lattafa-perfumes') OR LOWER(name) LIKE '%lattafa%')
  AND country != 'AE';

-- Rasasi: Dubai, UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'rasasi' OR LOWER(name) LIKE '%rasasi%')
  AND country != 'AE';

-- Ajmal: UAE operations (main house Dubai)
UPDATE brands SET country = 'AE'
WHERE (slug = 'ajmal' OR LOWER(name) LIKE '%ajmal%')
  AND country != 'AE';

-- Afnan: Dubai, UAE
UPDATE brands SET country = 'AE'
WHERE (slug IN ('afnan', 'afnan-perfumes') OR LOWER(name) LIKE '%afnan%')
  AND country != 'AE';

-- Gissah: registered in UAE/Dubai (gissahuae.com) — move from KW to AE
UPDATE brands SET country = 'AE'
WHERE (slug = 'gissah' OR LOWER(name) LIKE '%gissah%')
  AND country = 'KW';

-- Dukhni: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'dukhni' OR LOWER(name) LIKE '%dukhni%')
  AND country != 'AE';

-- Ard Al Zaafaran: Dubai, UAE
UPDATE brands SET country = 'AE'
WHERE (slug IN ('ard-al-zaafaran', 'ard-al-zaafaran-perfumes') OR LOWER(name) LIKE '%ard al zaafaran%')
  AND country != 'AE';

-- Al Wataniah: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'al-wataniah' OR LOWER(name) LIKE '%al wataniah%')
  AND country != 'AE';

-- My Perfumes: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'my-perfumes' OR LOWER(name) LIKE '%my perfumes%')
  AND country != 'AE';

-- Paris Corner: Dubai, UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'paris-corner' OR LOWER(name) LIKE '%paris corner%')
  AND country != 'AE';

-- Zimaya: by Afnan Group, Dubai UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'zimaya' OR LOWER(name) LIKE '%zimaya%')
  AND country != 'AE';

-- Arabiyat Mestamem: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'arabiyat-mestamem' OR LOWER(name) LIKE '%arabiyat%')
  AND country != 'AE';

-- Flavia Perfumes: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'flavia-perfumes' OR LOWER(name) LIKE '%flavia%')
  AND country != 'AE';

-- Emper: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'emper' OR LOWER(name) LIKE '%emper%')
  AND country != 'AE';

-- Khalis Perfumes: UAE
UPDATE brands SET country = 'AE'
WHERE (slug IN ('khalis', 'khalis-perfumes') OR LOWER(name) LIKE '%khalis%')
  AND country != 'AE';

-- Milestone Perfumes: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'milestone-perfumes' OR LOWER(name) LIKE '%milestone%')
  AND country != 'AE';

-- Manasik: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'manasik' OR LOWER(name) LIKE '%manasik%')
  AND country != 'AE';

-- Gulf Orchid: UAE (Sharjah)
UPDATE brands SET country = 'AE'
WHERE (slug = 'gulf-orchid' OR LOWER(name) LIKE '%gulf orchid%')
  AND country != 'AE';

-- Yas Perfumes: Abu Dhabi, UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'yas-perfumes' OR LOWER(name) LIKE '%yas perfumes%')
  AND country != 'AE';

-- Maison Alhambra: UAE (by Lattafa group)
UPDATE brands SET country = 'AE'
WHERE (slug = 'maison-alhambra' OR LOWER(name) LIKE '%maison alhambra%')
  AND country != 'AE';

-- Al Fares: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'al-fares' OR LOWER(name) LIKE '%al fares%')
  AND country != 'AE';

-- Otoori: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'otoori' OR LOWER(name) LIKE '%otoori%')
  AND country != 'AE';

-- Camion Blanc: UAE
UPDATE brands SET country = 'AE'
WHERE (slug = 'camion-blanc' OR LOWER(name) LIKE '%camion blanc%')
  AND country != 'AE';

-- ── Saudi Arabia (SA) corrections ─────────────────────────────────────────────
-- These are genuinely Saudi-founded houses

-- Arabian Oud: Riyadh, SA — largest oud retailer in the world
UPDATE brands SET country = 'SA'
WHERE (slug = 'arabian-oud' OR LOWER(name) LIKE '%arabian oud%')
  AND (country IS NULL OR country != 'SA');

-- Abdul Samad Al Qurashi: Mecca, SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'abdul-samad-al-qurashi' OR LOWER(name) LIKE '%qurashi%')
  AND (country IS NULL OR country != 'SA');

-- Surrati: Jeddah, SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'surrati' OR LOWER(name) LIKE '%surrati%')
  AND (country IS NULL OR country != 'SA');

-- Al Nuaim: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'al-nuaim' OR LOWER(name) LIKE '%al nuaim%')
  AND (country IS NULL OR country != 'SA');

-- Naseem: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'naseem' OR LOWER(name) LIKE '%naseem%')
  AND (country IS NULL OR country != 'SA');

-- Anfasic Dokhoon: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'anfasic-dokhoon' OR LOWER(name) LIKE '%anfasic%')
  AND (country IS NULL OR country != 'SA');

-- Deray: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'deray' OR LOWER(name) LIKE '%deray%')
  AND (country IS NULL OR country != 'SA');

-- Taif Al Emarat: SA (Taif region)
UPDATE brands SET country = 'SA'
WHERE (slug = 'taif-al-emarat' OR LOWER(name) LIKE '%taif al emarat%')
  AND (country IS NULL OR country != 'SA');

-- Royal Perfumes: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'royal-perfumes' OR LOWER(name) LIKE '%royal perfumes%')
  AND (country IS NULL OR country != 'SA');

-- Maison Asrar: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'maison-asrar' OR LOWER(name) LIKE '%maison asrar%')
  AND (country IS NULL OR country != 'SA');

-- Ahmed Al Maghribi: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'ahmed-al-maghribi' OR LOWER(name) LIKE '%ahmed al maghribi%')
  AND (country IS NULL OR country != 'SA');

-- Al Jazeera Perfumes: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'al-jazeera-perfumes' OR LOWER(name) LIKE '%al jazeera perfumes%')
  AND (country IS NULL OR country != 'SA');

-- Mutamayez: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'mutamayez' OR LOWER(name) LIKE '%mutamayez%')
  AND (country IS NULL OR country != 'SA');

-- Aseel: SA
UPDATE brands SET country = 'SA'
WHERE (slug = 'aseel' OR LOWER(name) LIKE '%aseel%')
  AND (country IS NULL OR country != 'SA');

-- Ibrahim Al Qurashi / Ibraq: SA (different family from Abdul Samad)
UPDATE brands SET country = 'SA'
WHERE (slug IN ('ibraq', 'ibrahim-al-qurashi') OR LOWER(name) LIKE '%ibrahim al qurashi%' OR LOWER(name) LIKE '%ibraq%')
  AND (country IS NULL OR country != 'SA');

-- ── Oman (OM) ─────────────────────────────────────────────────────────────────
-- Amouage: Muscat, Oman — founded 1983 by Sultan of Oman
UPDATE brands SET country = 'OM'
WHERE (slug = 'amouage' OR LOWER(name) LIKE '%amouage%')
  AND (country IS NULL OR country != 'OM');

-- Al Hajar: Oman
UPDATE brands SET country = 'OM'
WHERE (slug = 'al-hajar' OR LOWER(name) LIKE '%al hajar%')
  AND (country IS NULL OR country != 'OM');

-- Salalah Perfumes: Oman
UPDATE brands SET country = 'OM'
WHERE (slug = 'salalah-perfumes' OR LOWER(name) LIKE '%salalah%')
  AND (country IS NULL OR country != 'OM');

-- ── Bahrain (BH) ─────────────────────────────────────────────────────────────
-- Hind Al Oud: Bahrain — correct as-is
-- Al Dana: Bahrain

-- ── Kuwait (KW) ───────────────────────────────────────────────────────────────
-- Reef International: Kuwait
UPDATE brands SET country = 'KW'
WHERE (slug = 'reef-international' OR LOWER(name) LIKE '%reef international%')
  AND (country IS NULL OR country != 'KW');

-- Bujirami: Kuwait
UPDATE brands SET country = 'KW'
WHERE (slug = 'bujirami' OR LOWER(name) LIKE '%bujirami%')
  AND (country IS NULL OR country != 'KW');

-- Al Shareef Oudh: Kuwait
UPDATE brands SET country = 'KW'
WHERE (slug = 'al-shareef-oudh' OR LOWER(name) LIKE '%al shareef%')
  AND (country IS NULL OR country != 'KW');

-- Oud Milano: Kuwait
UPDATE brands SET country = 'KW'
WHERE (slug = 'oud-milano' OR LOWER(name) LIKE '%oud milano%')
  AND (country IS NULL OR country != 'KW');

-- J. Perfumes: Kuwait
UPDATE brands SET country = 'KW'
WHERE (slug = 'j-perfumes' OR LOWER(name) = 'j.')
  AND (country IS NULL OR country != 'KW');

-- Khasab: Kuwait
UPDATE brands SET country = 'KW'
WHERE (slug = 'khasab' OR LOWER(name) LIKE '%khasab%')
  AND (country IS NULL OR country != 'KW');

-- ── Egypt (EG) ────────────────────────────────────────────────────────────────
-- Al Rehab: Cairo, Egypt (already in patch-011, reinforcing here)
UPDATE brands SET country = 'EG'
WHERE (slug = 'al-rehab' OR LOWER(name) LIKE '%al rehab%')
  AND (country IS NULL OR country != 'EG');

-- ── Morocco (MA) ──────────────────────────────────────────────────────────────
-- El Nabil: Moroccan house, strong oud tradition
UPDATE brands SET country = 'MA'
WHERE (slug = 'el-nabil' OR LOWER(name) LIKE '%el nabil%')
  AND (country IS NULL OR country != 'MA');

-- Musc d Oro: MA
UPDATE brands SET country = 'MA'
WHERE (slug = 'musc-d-oro' OR LOWER(name) LIKE '%musc d%oro%')
  AND (country IS NULL OR country != 'MA');

-- ── Pakistan (PK) ────────────────────────────────────────────────────────────
-- J. Junaid Jamshed: Pakistani fashion & fragrance house
UPDATE brands SET country = 'PK'
WHERE (slug IN ('j-junaid-jamshed', 'junaid-jamshed') OR LOWER(name) LIKE '%junaid jamshed%')
  AND (country IS NULL OR country != 'PK');

-- Bonanza Satrangi: PK
UPDATE brands SET country = 'PK'
WHERE (slug = 'bonanza-satrangi' OR LOWER(name) LIKE '%bonanza%')
  AND (country IS NULL OR country != 'PK');

-- Scentsation: PK
UPDATE brands SET country = 'PK'
WHERE (slug = 'scentsation' OR LOWER(name) LIKE '%scentsation%')
  AND (country IS NULL OR country != 'PK');

-- ── Verify results ────────────────────────────────────────────────────────────
SELECT country, COUNT(*) AS brand_count
FROM brands
WHERE country IS NOT NULL
GROUP BY country
ORDER BY brand_count DESC;
