-- Fete v0 Demo Seed Data
-- Run this in Supabase SQL editor: https://supabase.com/dashboard → SQL editor
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING

-- ── Venues ────────────────────────────────────────────────────────────────────

INSERT INTO venues (
  name, slug, neighbourhood, description,
  capacity_min, capacity_max, price_estimate,
  event_types, photos, website
)
VALUES
  (
    'Morchella',
    'morchella',
    'Shoreditch',
    'A stunning private dining destination in the heart of Shoreditch. Morchella blends industrial-chic interiors with seasonal, ingredient-led menus. Two versatile private spaces make it ideal for alumni dinners, corporate celebrations, and intimate birthday gatherings.',
    20, 80,
    '£££',
    ARRAY['Alumni dinner', 'Corporate', 'Birthday', 'Party'],
    ARRAY[
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80'
    ],
    'https://morchella.co.uk'
  ),
  (
    'Boxcar',
    'boxcar',
    'Hackney',
    'Boxcar is a converted railway arch venue in Hackney with two distinct event spaces. The Main Hall holds up to 120 for large parties and corporate events, while the intimate Wine Cellar seats 20 for private tastings and dinners.',
    20, 120,
    '££',
    ARRAY['Party', 'Corporate', 'Workshop', 'Exhibition'],
    ARRAY[
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80'
    ],
    'https://boxcarhackney.co.uk'
  ),
  (
    'Tamila',
    'tamila',
    'Brixton',
    'Tamila is a vibrant, multi-level event space in the heart of Brixton. With a buzzing ground floor bar and a moody basement perfect for intimate events, it brings energy and soul to every gathering.',
    20, 100,
    '££',
    ARRAY['Party', 'Birthday', 'Alumni dinner', 'Corporate'],
    ARRAY[
      'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&q=80'
    ],
    'https://tamila.co.uk'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── Spaces ────────────────────────────────────────────────────────────────────
-- Get venue IDs first, then insert spaces

-- Morchella spaces
INSERT INTO spaces (venue_id, name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
SELECT
  v.id,
  s.name,
  s.capacity,
  s.base_price,
  s.photos,
  s.payment_deposit_pct,
  s.payment_min_spend,
  s.payment_pay_ahead
FROM venues v
CROSS JOIN (VALUES
  (
    'Private Dining Room',
    30,
    85,
    ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
           'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
    25,
    2000,
    false
  ),
  (
    'Garden Room',
    50,
    75,
    ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
           'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80'],
    25,
    3000,
    false
  )
) AS s(name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
WHERE v.slug = 'morchella'
  AND NOT EXISTS (
    SELECT 1 FROM spaces sp WHERE sp.venue_id = v.id AND sp.name = s.name
  );

-- Boxcar spaces
INSERT INTO spaces (venue_id, name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
SELECT
  v.id,
  s.name,
  s.capacity,
  s.base_price,
  s.photos,
  s.payment_deposit_pct,
  s.payment_min_spend,
  s.payment_pay_ahead
FROM venues v
CROSS JOIN (VALUES
  (
    'Main Hall',
    120,
    65,
    ARRAY['https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
           'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80'],
    30,
    5000,
    false
  ),
  (
    'Wine Cellar',
    20,
    95,
    ARRAY['https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80'],
    50,
    1500,
    true
  )
) AS s(name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
WHERE v.slug = 'boxcar'
  AND NOT EXISTS (
    SELECT 1 FROM spaces sp WHERE sp.venue_id = v.id AND sp.name = s.name
  );

-- Tamila spaces
INSERT INTO spaces (venue_id, name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
SELECT
  v.id,
  s.name,
  s.capacity,
  s.base_price,
  s.photos,
  s.payment_deposit_pct,
  s.payment_min_spend,
  s.payment_pay_ahead
FROM venues v
CROSS JOIN (VALUES
  (
    'Ground Floor',
    80,
    70,
    ARRAY['https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80',
           'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'],
    25,
    4000,
    false
  ),
  (
    'Basement',
    40,
    80,
    ARRAY['https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&q=80'],
    30,
    2500,
    false
  )
) AS s(name, capacity, base_price, photos, payment_deposit_pct, payment_min_spend, payment_pay_ahead)
WHERE v.slug = 'tamila'
  AND NOT EXISTS (
    SELECT 1 FROM spaces sp WHERE sp.venue_id = v.id AND sp.name = s.name
  );

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT v.name AS venue, v.slug, COUNT(s.id) AS space_count
FROM venues v
LEFT JOIN spaces s ON s.venue_id = v.id
WHERE v.slug IN ('morchella', 'boxcar', 'tamila')
GROUP BY v.id, v.name, v.slug
ORDER BY v.name;
