-- patch-005-fix-gender.sql
-- Re-infer gender for all products using name signals
-- Run this in Supabase SQL editor

-- Step 1: Set MALE where strong male signals are present
UPDATE products
SET gender = 'men'
WHERE (
  name ILIKE '%for men%'
  OR name ILIKE '%pour homme%'
  OR name ILIKE '%pour him%'
  OR name ILIKE '% homme%'
  OR name ILIKE '%masculin%'
  OR name ILIKE '%for him%'
  OR name ILIKE '% men %'
  OR name ILIKE '% men''s%'
  OR name ILIKE '%sport%'
  OR name ILIKE '%hawas%'
  OR name ILIKE '%asad%'
  OR name ILIKE '%sultan%'
  OR name ILIKE '%sheikh%'
  OR name ILIKE '%shaikh%'
  OR name ILIKE '%rajul%'
  OR name ILIKE '%club de nuit homme%'
  OR name ILIKE '%egzotika%'
)
AND NOT (
  name ILIKE '%for women%'
  OR name ILIKE '%pour femme%'
  OR name ILIKE '%pour elle%'
  OR name ILIKE '% femme%'
  OR name ILIKE '%unisex%'
);

-- Step 2: Set FEMALE where strong female signals are present
UPDATE products
SET gender = 'women'
WHERE (
  name ILIKE '%for women%'
  OR name ILIKE '%pour femme%'
  OR name ILIKE '%pour elle%'
  OR name ILIKE '% femme%'
  OR name ILIKE '%for her%'
  OR name ILIKE '% women %'
  OR name ILIKE '% women''s%'
  OR name ILIKE '%feminine%'
  OR name ILIKE '% lady%'
  OR name ILIKE '% belle%'
  OR name ILIKE '%princess%'
  OR name ILIKE '%bloom%'
  OR name ILIKE '%blossom%'
  OR name ILIKE '%floral%'
  OR name ILIKE '%floralia%'
  OR name ILIKE '%rose %'
  OR name ILIKE '% rose%'
  OR name ILIKE '%rosé%'
  OR name ILIKE '%jasmine%'
  OR name ILIKE '%gardenia%'
  OR name ILIKE '%cherry blossom%'
  OR name ILIKE '%peony%'
  OR name ILIKE '%magnolia%'
  OR name ILIKE '%lily%'
  OR name ILIKE '%violet%'
  OR name ILIKE '%pink%'
  OR name ILIKE '%blush%'
  OR name ILIKE '%khamrah%'
)
AND NOT (
  name ILIKE '%for men%'
  OR name ILIKE '%pour homme%'
  OR name ILIKE '%unisex%'
);

-- Step 3: Explicit unisex
UPDATE products
SET gender = 'unisex'
WHERE (
  name ILIKE '%unisex%'
  OR name ILIKE '%for all%'
  OR name ILIKE '%him & her%'
  OR name ILIKE '%her & him%'
  OR name ILIKE '%men & women%'
  OR name ILIKE '%women & men%'
  OR name ILIKE '%men and women%'
);

-- Check the distribution after running
SELECT gender, COUNT(*) as count
FROM products
GROUP BY gender
ORDER BY count DESC;
