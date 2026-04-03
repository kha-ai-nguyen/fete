import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Sourced from brochures in C:\Users\khaai\Downloads\Brochures
const venues = [
  {
    name: 'The Palm House',
    neighbourhood: 'Victoria',
    capacity_min: 6,
    capacity_max: 400,
    price_estimate: '££',
    event_types: ['Party', 'Corporate', 'Exhibition', 'Workshop'],
    description:
      'A vibrant bar and restaurant in the heart of Victoria offering private spaces for groups of 6 to 400. The flexible layout spans a 250-person standing bar, a 50-person Social Space, and a 100-seated restaurant. Bespoke packages for birthdays, office parties, product launches, and team away days.',
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
    website: 'https://thepalmhouse.co.uk',
  },
  {
    name: '41 Portland Place',
    neighbourhood: 'Marylebone',
    capacity_min: 40,
    capacity_max: 120,
    price_estimate: '£114/head',
    event_types: ['Party', 'Corporate', 'Wedding'],
    description:
      'A Grade II* listed Georgian townhouse with a hidden rooftop terrace in Marylebone, moments from Oxford Circus and Regent\'s Park. The first floor and eucalyptus-lined sun-trap terrace hosts up to 60 for dinner or 120 for a drinks reception. Summer package includes BBQ, unlimited house drinks and garden games.',
    photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
    website: 'https://41portlandplace.com',
  },
  {
    name: 'Boxcar Bread & Wine',
    neighbourhood: 'Connaught Village',
    capacity_min: 20,
    capacity_max: 80,
    price_estimate: '£££',
    event_types: ['Corporate', 'Wedding', 'Party'],
    description:
      'Set in the heart of Connaught Village, minutes from Hyde Park, Boxcar Bread & Wine is a refined neighbourhood restaurant with floor-to-ceiling windows and a warm, elegant atmosphere. Available for exclusive hire for up to 80 standing or 40 seated — ideal for corporate gatherings, private celebrations, and intimate dinners.',
    photos: ['https://images.unsplash.com/photo-1555396273-b6b79d4b1a7f?w=800&q=80'],
    website: 'https://boxcarbreadandwine.com',
  },
  {
    name: 'COYA Mayfair',
    neighbourhood: 'Mayfair',
    capacity_min: 12,
    capacity_max: 250,
    price_estimate: '££££',
    event_types: ['Corporate', 'Party', 'Wedding', 'Exhibition'],
    description:
      'Since 2012, COYA has offered one of London\'s most immersive private event experiences. Choose from the Andean Room (25 seated), the Illapa Room (60 seated), an intimate private dining room (12 seated), or full exclusive hire of the Peruvian restaurant (120 seated / 250 standing). Latin rhythms, Pisco infusions, and exceptional ceviche.',
    photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'],
    website: 'https://coyarestaurant.com',
  },
  {
    name: 'St Pancras by Searcys',
    neighbourhood: 'King\'s Cross',
    capacity_min: 2,
    capacity_max: 400,
    price_estimate: '£43/head',
    event_types: ['Corporate', 'Party', 'Wedding', 'Exhibition'],
    description:
      'Located above the bustle of St Pancras International, Searcys boasts the longest Champagne Bar in Europe. The brasserie and champagne bar transform into spectacular event spaces for 2–400 guests. Packages from £43/head for lunch, £68/head for dinner. Semi-exclusive or full exclusive hire available.',
    photos: ['https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80'],
    website: 'https://searcys.co.uk/venues/st-pancras',
  },
  {
    name: 'The Stafford London',
    neighbourhood: 'St James\'s',
    capacity_min: 12,
    capacity_max: 85,
    price_estimate: '££££',
    event_types: ['Corporate', 'Wedding', 'Workshop'],
    description:
      'One of London\'s most discreet and luxurious event venues. Seven private dining spaces including the extraordinary 380-year-old vaulted wine cellars — perfect for intimate candlelit dinners (up to 44), wine tastings (up to 40), or standing receptions (up to 85). Located steps from Green Park in the heart of St James\'s.',
    photos: ['https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80'],
    website: 'https://thestaffordlondon.com',
  },
  {
    name: 'The Audley — Mount St. Restaurant',
    neighbourhood: 'Mayfair',
    capacity_min: 12,
    capacity_max: 60,
    price_estimate: '££££',
    event_types: ['Corporate', 'Wedding', 'Party'],
    description:
      'An 1888 Victorian building on the corner of Mount Street and South Audley Street, housing a ground-floor pub, first-floor modern restaurant, and four extraordinary private dining rooms showcasing over 200 works of art including Warhol, Matisse, and Lucian Freud. The Italian Room seats 12, the Swiss Room 14. Architecture by Luis Laplace.',
    photos: ['https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80'],
    website: 'https://theaudleymayfair.com',
  },
  {
    name: 'Nobu London',
    neighbourhood: 'Mayfair',
    capacity_min: 13,
    capacity_max: 250,
    price_estimate: '££££',
    event_types: ['Corporate', 'Party', 'Wedding', 'Exhibition'],
    description:
      'Europe\'s first Nobu, a landmark of Mayfair dining on Old Park Lane. The White Room private dining space seats 50 or hosts 70 standing beneath a skylight atrium. Full exclusive hire seats 200 or stands 250, with sweeping views over Hyde Park. Three decades of exceptional Japanese cuisine and unmatched hospitality.',
    photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
    website: 'https://noburestaurants.com/london',
  },
  {
    name: 'No. 11 Cavendish Square',
    neighbourhood: 'Marylebone',
    capacity_min: 10,
    capacity_max: 200,
    price_estimate: '£££',
    event_types: ['Corporate', 'Workshop', 'Exhibition'],
    description:
      'A Grade II-listed Georgian townhouse moments from Oxford Circus offering exceptional event spaces across multiple floors. Rooms include the Burdett Suite, Orangery and Courtyard, Maynard and Marlborough Theatres, and a private garden. Catering by Searcys, full AV capabilities, and complimentary wifi throughout.',
    photos: ['https://images.unsplash.com/photo-1579656381208-9a0ab29adfa5?w=800&q=80'],
    website: 'https://no11cavendishsquare.com',
  },
  {
    name: 'PARO',
    neighbourhood: 'Covent Garden',
    capacity_min: 10,
    capacity_max: 160,
    price_estimate: '£39/head',
    event_types: ['Corporate', 'Party'],
    description:
      'London\'s hottest Indian restaurant, situated next to the Lyceum Theatre in Covent Garden. Award-winning Indian cuisine in an immersive, visually stunning dining environment. Group packages from £28/head, experienced with Deloitte, Bank of England, and Allen Overy. Accommodates 10–160 guests across semi-private and full exclusive hire.',
    photos: ['https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80'],
    website: 'https://restaurantparo.com',
  },
  {
    name: 'Parrillan',
    neighbourhood: 'King\'s Cross',
    capacity_min: 20,
    capacity_max: 100,
    price_estimate: '£75/head',
    event_types: ['Party', 'Corporate'],
    description:
      'Parrillan brings the spirit of the Spanish asador to Coal Drops Yard. Group menus built around the table-sharing tradition: whole suckling pig, dry-aged ex-dairy beef txuleta, and seasonal sides. Signature set menu from £75/person. Part of the Barrafina group — the same precision applied to large-group events.',
    photos: ['https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80'],
    website: 'https://parrillan.co.uk',
  },
  {
    name: 'Hawksmoor Wood Wharf',
    neighbourhood: 'Canary Wharf',
    capacity_min: 20,
    capacity_max: 375,
    price_estimate: '£££',
    event_types: ['Corporate', 'Party', 'Wedding'],
    description:
      'The largest Hawksmoor in London, seating 375 for exclusive hire on the waterfront at Wood Wharf. Twice winner of World\'s Best Steak Restaurant and Certified B Corp. The private Queenie Watts room seats 21; the Hawksmoor Bar accommodates 90 seated or 330 standing. 18 years of delivering world-class events for Fortune 500 companies and A-list occasions.',
    photos: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'],
    website: 'https://thehawksmoor.com',
  },
  {
    name: 'Morchella',
    neighbourhood: 'Bethnal Green',
    capacity_min: 10,
    capacity_max: 65,
    price_estimate: '£75/head',
    event_types: ['Corporate', 'Wedding', 'Party'],
    description:
      'A modern Mediterranean restaurant and wine bar available for both intimate private dining (10–18 guests, from £55/head) and full exclusive hire of the main dining room (up to 65 guests). Relaxed but refined atmosphere, seasonal produce, and flexible bespoke menus. Minimum spend from £750 for lunch.',
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
    website: 'https://morchelladining.co.uk',
  },
  {
    name: 'Brunswick House',
    neighbourhood: 'Vauxhall',
    capacity_min: 20,
    capacity_max: 120,
    price_estimate: '£££',
    event_types: ['Wedding', 'Corporate', 'Party'],
    description:
      'An 18th-century Grade II listed Georgian mansion in Vauxhall, one of London\'s most unusual and beautiful private dining venues. Three floors of rooms plus a private terrace and garden, spread across intimate and larger event spaces. Restaurant and bar run by Jackson Boxer (Orasay) and Frank Boxer. Acclaimed by Esquire and Vivienne Westwood.',
    photos: ['https://images.unsplash.com/photo-1543007630-9359815b77b7?w=800&q=80'],
    website: 'https://brunswickhousevauxhall.co.uk',
  },
  {
    name: 'Rochelle Canteen',
    neighbourhood: 'Shoreditch',
    capacity_min: 20,
    capacity_max: 70,
    price_estimate: '£90/head',
    event_types: ['Wedding', 'Party', 'Corporate', 'Exhibition'],
    description:
      'Rochelle Canteen offers private hire for up to 70 guests inside the canteen and heated, tented terrace in Shoreditch. Nose-to-tail seasonal menus served on sharing platters at £90/head. £4,500 minimum food and drink spend plus £2,000 venue hire. Enquiries accepted up to 6 months in advance.',
    photos: ['https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'],
    website: 'https://rochellecanteen.com',
  },
  {
    name: 'Roe',
    neighbourhood: 'Canary Wharf',
    capacity_min: 10,
    capacity_max: 80,
    price_estimate: '£££',
    event_types: ['Corporate', 'Party'],
    description:
      'A stylish and versatile restaurant at Wood Wharf, two minutes from Canary Wharf station. The private Garden Room seats up to 26 guests for intimate occasions. The Bar Area accommodates 50 seated or 80 standing for larger receptions. A stunning outdoor terrace offers alfresco dining and drinks in warmer months.',
    photos: ['https://images.unsplash.com/photo-1559181567-c3190ecabd17?w=800&q=80'],
    website: 'https://roerestaurant.co.uk',
  },
  {
    name: 'Treehouse Hotel London',
    neighbourhood: 'Marylebone',
    capacity_min: 12,
    capacity_max: 250,
    price_estimate: '£££',
    event_types: ['Corporate', 'Party', 'Wedding', 'Exhibition'],
    description:
      'Perched high above Regent Street, Treehouse Hotel blends playful design with breathtaking skyline views. Madera restaurant hosts up to 130 seated or 250 standing for exclusive hire; the private Madera Room seats 80. The rooftop Nest bar offers a 360-degree terrace with DJ booth for the ultimate celebration. Elevated Mexican cuisine throughout.',
    photos: ['https://images.unsplash.com/photo-1547592180-85f173990819?w=800&q=80'],
    website: 'https://treehousehotels.com/london',
  },
  {
    name: 'Alfi',
    neighbourhood: 'Spitalfields',
    capacity_min: 10,
    capacity_max: 120,
    price_estimate: '£55/head',
    event_types: ['Corporate', 'Party', 'Workshop'],
    description:
      'An Italian restaurant and events space at Spitalfields Market, offering a series of signature group experiences including The Pasta Club, pizza nights, and bespoke corporate dinners. Flexible hire of semi-private areas or full restaurant for up to 120 guests. Packages from £45/head including multi-course sharing menus of handmade pasta, pizza, and seasonal mains.',
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
    website: 'https://alfirestaurant.com',
  },
]

async function seed() {
  console.log(`Seeding ${venues.length} venues from brochures...`)
  const { data, error } = await supabase.from('venues').insert(venues).select()
  if (error) {
    console.error('Error seeding venues:', error.message)
    process.exit(1)
  }
  console.log(`✅ Inserted ${data.length} venues:`)
  data.forEach((v: { name: string; neighbourhood: string; id: string }) =>
    console.log(`  - ${v.name} (${v.neighbourhood}) — ${v.id}`)
  )
}

seed()
