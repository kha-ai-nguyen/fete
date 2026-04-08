// Unsplash photo pool (from existing seed data)
const PHOTOS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-b6b79d4b1a7f?w=800&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80',
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1579656381208-9a0ab29adfa5?w=800&q=80',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'https://images.unsplash.com/photo-1543007630-9359815b77b7?w=800&q=80',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
  'https://images.unsplash.com/photo-1559181567-c3190ecabd17?w=800&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990819?w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
  'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&q=80',
]

const VENUE_NAMES = [
  'The Velvet Room', 'Copper & Ivy', 'Sable House', 'The Gilt Mirror',
  'Wren & Fox', 'Maison Noir', 'The Amber Yard', 'Clover & Stone',
  'The Lacquer Bar', 'Bramble Hall', 'Oro', 'The Glass Lantern',
  'Pebble & Rye', 'The Crimson Table', 'Dusk', 'The Chalk Room',
  'Fern & Ember', 'The Ivory Arch', 'Husk', 'The Painted Bird',
  'Sage & Bone', 'The Honey Pot', 'Loom', 'The Iron Veil',
  'Moss & Flint', 'The Pearl Stair', 'Cinder', 'The Rosewood Cellar',
  'Salt & Vine', 'The Marble Fox', 'Quill', 'The Tallow Room',
  'Birch & Brine', 'The Copper Still', 'Dew', 'The Wicker Gate',
  'Oak & Ochre', 'The Silver Bell', 'Grain', 'The Slate Yard',
  'Thorn & Thread', 'The Brass Owl', 'Ember', 'The Linen House',
  'Reed & Rust', 'The Onyx Den', 'Bloom', 'The Porcelain Room',
  'Ash & Olive', 'The Cobalt Club',
]

const SPACE_NAMES = [
  'Private Dining Room', 'Main Hall', 'Garden Room', 'The Terrace',
  'Wine Cellar', 'Ground Floor', 'Mezzanine', 'The Courtyard',
  'Rooftop Bar', 'Conservatory', 'The Library', 'Grand Salon',
  'The Gallery', 'Basement Lounge', 'The Parlour', 'Orangery',
  'The Study', 'Atrium', 'The Vault', 'Drawing Room',
  'The Snug', 'Upper Deck', 'The Greenhouse', 'Loft Space',
  'The Den', 'Crystal Room', 'The Workshop', 'Chapel Room',
  'The Nest', 'Balcony Suite', 'The Alcove', 'Sun Room',
  'The Hearth', 'Sky Lounge', 'The Bower', 'Taproom',
  'The Cloister', 'Panorama Suite', 'The Forge', 'Lantern Room',
  'The Bridge', 'Club Room', 'The Pavilion', 'Barrel Room',
  'The Glasshouse', 'Studio', 'The Rotunda', 'Loggia',
  'The Refectory', 'Chandelier Room',
]

const NEIGHBOURHOODS = [
  'Shoreditch', 'Mayfair', 'Hackney', 'Brixton', 'Marylebone',
  'Soho', 'Covent Garden', 'Islington', 'Peckham', 'King\'s Cross',
  'Notting Hill', 'Bermondsey', 'Fitzrovia', 'Dalston', 'Clerkenwell',
  'Bethnal Green', 'Camden', 'Vauxhall', 'Battersea', 'Whitechapel',
]

// Seeded pseudo-random for deterministic results
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

export interface ResultSpace {
  id: string
  venue_id: string
  name: string
  capacity: number
  base_price: number
  photos: string[]
  payment_deposit_pct: number | null
  payment_min_spend: number | null
  payment_pay_ahead: boolean
  created_at: string
  venue: { id: string; name: string; neighbourhood: string }
  available: boolean
  distance_km: number
  total_price: number
}

export function generateMockSpaces(headcount: number): ResultSpace[] {
  const rand = seededRandom(42)

  return Array.from({ length: 50 }, (_, i) => {
    // Always 3-5 photos for a consistent mosaic
    const photoCount = Math.floor(rand() * 3) + 3
    const startIdx = Math.floor(rand() * PHOTOS.length)
    const photos = Array.from({ length: photoCount }, (_, j) =>
      PHOTOS[(startIdx + j) % PHOTOS.length]
    )

    const capacity = Math.floor(rand() * 380) + 20
    const basePrice = Math.floor(rand() * 126) + 25
    const distanceKm = Math.round((rand() * 4.9 + 0.1) * 10) / 10
    const depositPct = [null, 25, 30, 50][Math.floor(rand() * 4)]
    const minSpend = [null, 1000, 1500, 2000, 2500, 3000, 4000, 5000][Math.floor(rand() * 8)]
    const neighbourhood = NEIGHBOURHOODS[Math.floor(rand() * NEIGHBOURHOODS.length)]

    const totalPrice = basePrice * headcount + (minSpend ?? 0)
    const available = rand() > 0.15

    return {
      id: `mock-${i}`,
      venue_id: `mock-venue-${i}`,
      name: SPACE_NAMES[i % SPACE_NAMES.length],
      capacity,
      base_price: basePrice,
      photos,
      payment_deposit_pct: depositPct,
      payment_min_spend: minSpend,
      payment_pay_ahead: rand() > 0.8,
      created_at: new Date().toISOString(),
      venue: {
        id: `mock-venue-${i}`,
        name: VENUE_NAMES[i],
        neighbourhood,
      },
      available,
      distance_km: distanceKm,
      total_price: totalPrice,
    }
  })
}
