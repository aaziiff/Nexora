import { CategoryInfo, Product, SiteSettings } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-home',
    slug: 'home',
    name: 'HOME',
    tagline: 'Calm spaces, organized living.',
    description: 'Thoughtfully designed organizers, desk accents, and ambient lifestyle essentials that bring quiet order to your space.',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop',
    item_count: 6,
  },
  {
    id: 'cat-care',
    slug: 'care',
    name: 'CARE',
    tagline: 'Elevated personal rituals.',
    description: 'Minimalist facial tools, scalp massaging accessories, and natural grooming tools built for mindful morning and evening routines.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    item_count: 5,
  },
  {
    id: 'cat-kitchen',
    slug: 'kitchen',
    name: 'KITCHEN',
    tagline: 'Simple tools, daily joy.',
    description: 'Ergonomic culinary accessories, airtight borosilicate containers, and precision counter essentials crafted for everyday ease.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop',
    item_count: 6,
  },
  {
    id: 'cat-bath',
    slug: 'bath',
    name: 'BATH',
    tagline: 'Sensory everyday sanctuary.',
    description: 'Diatomite quick-dry stone trays, amber glass refill dispensers, and soft waffle textiles for a tranquil bath experience.',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1200&auto=format&fit=crop',
    item_count: 4,
  },
  {
    id: 'cat-everyday',
    slug: 'everyday',
    name: 'EVERYDAY',
    tagline: 'Smart utilities on the move.',
    description: 'Compact daily carry accessories, cable organizers, magnetic key anchors, and smart utility tools you will reach for daily.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    item_count: 5,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'nx-01',
    slug: 'diatomite-quick-dry-stone-tray',
    name: 'Diatomite Fast-Dry Stone Caddy',
    tagline: 'Instant-absorbing natural stone counter dock',
    category: 'bath',
    category_name: 'BATH',
    price: 1199,
    original_price: 1599,
    discount: '25% OFF',
    description: 'Engineered from ultra-absorbent natural fossilized diatomaceous earth, this minimalist stone caddy evaporates standing water within 60 seconds, keeping sinks and countertops pristine.',
    story: 'We were tired of damp, mildew-prone silicone mats around bathroom and kitchen faucets. The Diatomite Fast-Dry Stone Caddy harnesses microscopic pores to instantly draw water away from soap bottles, tumblers, and toothbrushes into ambient air.',
    benefits: [
      'Absorbs and dissipates water droplets within seconds',
      'Naturally antibacterial and mildew-resistant',
      'Solid brushed brass elevation feet prevent surface pooling',
      'Zero synthetic chemicals or plastic waste'
    ],
    features: [
      '100% natural organic diatomaceous mineral composite',
      'Includes 4 corrosion-resistant brass leveling pads',
      'Matte stone texture with gentle rounded bevels',
      'Easy to refresh with included natural sanding buff'
    ],
    specifications: [
      { label: 'Dimensions', value: '28 cm × 12 cm × 2.5 cm' },
      { label: 'Weight', value: '420 grams' },
      { label: 'Material', value: 'Natural Diatomite Earth + Solid Brass' },
      { label: 'Finish', value: 'Unsealed Soft Stone Ivory' },
      { label: 'Care', value: 'Rinse with warm water; sand lightly annually' }
    ],
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: true,
    is_bestseller: true,
    in_stock: true,
    stock_count: 34,
    rating: 4.9,
    review_count: 18,
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'nx-02',
    slug: 'sculpted-solid-brass-incense-dock',
    name: 'Precision Solid Brass Burner & Ash Well',
    tagline: 'Heavyweight monolith for quiet evening rituals',
    category: 'home',
    category_name: 'HOME',
    price: 1499,
    original_price: 1899,
    discount: '21% OFF',
    description: 'Machined from a single cylinder of solid brass, this understated dock holds standard and Japanese coreless incense sticks with effortless poise while gathering falling ash cleanly.',
    story: 'Creating a moment of calm shouldn’t leave a mess on your side table. We designed a substantial, low-profile dock with a weighted center of gravity that feels timeless and sculptural even when idle.',
    benefits: [
      'Substantial 380g weight ensures complete stability',
      'Deep parabolic reservoir contains all micro ash',
      'Dual gauge bore fits both bamboo-core and Japanese incense',
      'Ages gracefully with a natural warm patina'
    ],
    features: [
      'CNC milled solid brass with satin micro-brushing',
      'Protective natural cork underlay to protect fine wood surfaces',
      'Compatible with sticks up to 2.5mm diameter',
      'Zero tool maintenance required'
    ],
    specifications: [
      { label: 'Dimensions', value: '11 cm Diameter × 2.2 cm Height' },
      { label: 'Weight', value: '380 grams' },
      { label: 'Material', value: 'C36000 Solid Brass & Natural Cork' },
      { label: 'Origin', value: 'Crafted in Moradabad, India' },
      { label: 'Packaging', value: 'Recycled unbleached kraft box' }
    ],
    images: [
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: true,
    is_bestseller: false,
    in_stock: true,
    stock_count: 19,
    rating: 4.8,
    review_count: 12,
    created_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'nx-03',
    slug: 'ergonomic-ceramic-burr-coffee-grinder',
    name: 'Tactile Hand Coffee Mill with Hexagonal Grip',
    tagline: 'Uniform particle control for contemplative mornings',
    category: 'kitchen',
    category_name: 'KITCHEN',
    price: 2299,
    original_price: 2899,
    discount: '20% OFF',
    description: 'Anodized aerospace aluminum body with 420 stainless steel conical burrs. Smooth dual-bearing rotation produces consistent espresso, pour-over, and French press grounds with whisper-quiet tactile feedback.',
    story: 'Mornings are too precious for screeching electric motors. This hand mill turns the preparation of your morning cup into a sensory ritual of precision, aroma, and mindful satisfaction.',
    benefits: [
      'Dual-bearing stabilization eliminates burr wobble',
      'Stepped micro-click grind dial for precision extraction',
      'Fits neatly in bags for travel or outdoor camp brews',
      'Disassembles in seconds without tools for simple cleaning'
    ],
    features: [
      'CNC 38mm 420 High-Carbon Stainless Steel Conical Burrs',
      'Textured knurled grip prevents hand slipping',
      'Magnetic fold-down walnut crank handle',
      'Capacity: 25-30g whole roasted beans'
    ],
    specifications: [
      { label: 'Capacity', value: '30g hopper & catch cup' },
      { label: 'Burr Type', value: '420 Stainless Conical Burrs' },
      { label: 'Weight', value: '510 grams' },
      { label: 'Dimensions', value: '15.5 cm Height × 5.2 cm Body Width' },
      { label: 'Grind Settings', value: '36 discrete stepped clicks' }
    ],
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: true,
    is_bestseller: true,
    in_stock: true,
    stock_count: 22,
    rating: 5.0,
    review_count: 27,
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'nx-04',
    slug: 'sculpting-bian-stone-facial-guasha',
    name: 'Thermal Bian Stone Contouring Tool',
    tagline: 'Mineral-rich resonance for facial tension relief',
    category: 'care',
    category_name: 'CARE',
    price: 899,
    original_price: 1199,
    discount: '25% OFF',
    description: 'Carved from authentic volcanic Bian stone containing over 40 trace minerals, this ergonomic tool naturally retains warmth to stimulate lymphatic drainage and soothe jaw clenching.',
    story: 'Modern screen time leaves daily tension accumulated in the forehead, temples, and jawline. This Bian stone contours naturally along facial bone structure, grounding your bedtime routine in tactile calm.',
    benefits: [
      'Relieves facial muscular tension and brow tightness',
      'Encourages natural blood circulation and lymphatic drainage',
      'Smooth curved ridges hug cheekbones and jawline',
      'Warms easily under warm tap water for soothing therapy'
    ],
    features: [
      'Natural Sibin Bian volcanic stone composition',
      'Hand-polished satin edge that glides effortlessly with facial oil',
      'Comes with a protective natural linen drawstring pouch',
      'Hypoallergenic and naturally non-porous'
    ],
    specifications: [
      { label: 'Material', value: '100% Authentic Sibin Bian Stone' },
      { label: 'Dimensions', value: '9.5 cm × 7 cm × 0.8 cm' },
      { label: 'Weight', value: '95 grams' },
      { label: 'Included', value: 'Linen pouch & routine guide card' }
    ],
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: true,
    is_bestseller: true,
    in_stock: true,
    stock_count: 45,
    rating: 4.9,
    review_count: 31,
    created_at: '2026-02-05T10:00:00Z'
  },
  {
    id: 'nx-05',
    slug: 'modular-magnetic-desk-cable-anchor',
    name: 'Cast Aluminum Magnetic Cable Orbit',
    tagline: 'Zero-drop wire organization for clean desks',
    category: 'everyday',
    category_name: 'EVERYDAY',
    price: 749,
    original_price: 999,
    discount: '25% OFF',
    description: 'Heavy cast-alloy base with 3 snap-on magnetic collars that keep charging cables, laptop cords, and headphones anchored cleanly on your nightstand or workspace.',
    story: 'Hunting for charging cables that slipped behind your desk is a micro-frustration that disrupts your flow. We built a weighted geometric dock with satisfying magnetic snap-actions.',
    benefits: [
      'Weighted metal base stays securely in place without messy adhesive',
      'Collars fit USB-C, Lightning, braided, and audio cables',
      'Re-positionable micro-suction silicone base leaves zero residue',
      'Matte charcoal powder-coated finish matches any decor'
    ],
    features: [
      'Cast zinc-aluminum alloy with weighted internal core',
      'Includes 3 modular neodymium magnetic cable collars',
      'Washable micro-suction grip pad on base',
      'Compact footprint preserves valuable desk area'
    ],
    specifications: [
      { label: 'Base Dimensions', value: '8.5 cm × 2.2 cm × 1.8 cm' },
      { label: 'Total Weight', value: '180 grams' },
      { label: 'Magnets', value: 'N52 Neodymium rare-earth magnets' },
      { label: 'Color', value: 'Matte Deep Charcoal' }
    ],
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: false,
    is_bestseller: true,
    in_stock: true,
    stock_count: 50,
    rating: 4.7,
    review_count: 14,
    created_at: '2026-02-10T10:00:00Z'
  },
  {
    id: 'nx-06',
    slug: 'amber-glass-dispenser-pair',
    name: 'Refillable Amber Glass Soap & Lotion Flacons',
    tagline: 'Substantial apothecary glass with stainless pump heads',
    category: 'bath',
    category_name: 'BATH',
    price: 999,
    original_price: 1299,
    discount: '23% OFF',
    description: 'Set of two 500ml thick-walled amber apothecary glass dispensers fitted with matte black stainless steel pumps. Designed to reduce single-use plastic while elevating your basin.',
    story: 'Loud branded plastic bottles clutter the eye in bathrooms and kitchens. These apothecary flacons protect light-sensitive soaps and oils while creating a tranquil, unified vanity.',
    benefits: [
      'UV-blocking amber glass preserves organic oils and soaps',
      'Smooth, non-dripping metal spring-lock pump action',
      'Includes waterproof minimalist vinyl decal labels',
      'Infinitely refillable for zero bathroom plastic waste'
    ],
    features: [
      '2 × 500ml Pharmaceutical grade lead-free glass bottles',
      '304 Stainless steel matte charcoal pump heads',
      'Included labels: Hands, Dishes, Body, Wash',
      'Non-slip silicone coaster rings included'
    ],
    specifications: [
      { label: 'Capacity', value: '500 ml each (Set of 2)' },
      { label: 'Dimensions', value: '21 cm Height × 7.5 cm Diameter' },
      { label: 'Pump Material', value: '304 Stainless Steel' },
      { label: 'Glass', value: 'Heavyweight Tinted Borosilicate' }
    ],
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: false,
    is_bestseller: false,
    in_stock: true,
    stock_count: 28,
    rating: 4.8,
    review_count: 19,
    created_at: '2026-02-12T10:00:00Z'
  },
  {
    id: 'nx-07',
    slug: 'japanese-style-matte-ceramic-oil-cruet',
    name: 'No-Drip Matte Ceramic Oil & Vinegar Cruet',
    tagline: 'Weighted gravity spout for measured kitchen pours',
    category: 'kitchen',
    category_name: 'KITCHEN',
    price: 1249,
    original_price: 1599,
    discount: '21% OFF',
    description: 'Hand-thrown stoneware feel with an automatic weighted gravity stopper. Opens smoothly as you tilt to pour and seals airtight when placed upright, preventing countertop rings.',
    story: 'Cooking should feel intuitive, not messy. We shaped this ceramic cruet to feel balanced in your hand with a spout that cuts off every drop cleanly.',
    benefits: [
      'Automatic gravity flap opens and closes on tilt',
      'Airtight silicone gasket keeps olive oils fresh',
      'Opaque ceramic shields oil from degradation by sunlight',
      'Wide neck mouth allows refilling without a funnel'
    ],
    features: [
      'High-fired stoneware ceramic with chalk-matte glaze',
      'Food-grade 304 stainless steel gravity spout',
      'Dishwasher safe body',
      'Volume capacity: 480ml'
    ],
    specifications: [
      { label: 'Capacity', value: '480 ml' },
      { label: 'Height', value: '19.5 cm' },
      { label: 'Base Width', value: '8.2 cm' },
      { label: 'Weight', value: '390 grams' }
    ],
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: false,
    is_bestseller: false,
    in_stock: true,
    stock_count: 15,
    rating: 4.9,
    review_count: 8,
    created_at: '2026-02-18T10:00:00Z'
  },
  {
    id: 'nx-08',
    slug: 'minimalist-pocket-titanium-key-clip',
    name: 'Grade-5 Titanium Key Carabiner & Bottle Opener',
    tagline: 'Ultralight everyday carry milled from aerospace titanium',
    category: 'everyday',
    category_name: 'EVERYDAY',
    price: 899,
    original_price: 1199,
    discount: '25% OFF',
    description: 'Weighing only 16 grams, this skeletonized titanium carabiner clips securely to belt loops or bag straps with an integrated lever-action bottle opener and anti-pinch gate.',
    story: 'Heavy key rings stretch pockets and jingle annoyingly. This titanium clip simplifies your daily carry into a sleek, silent utility piece built to outlast a lifetime of daily use.',
    benefits: [
      'Grade 5 titanium is ultra-strong yet weighs almost nothing',
      'Integrated discreet bottle opener lever',
      'Spring-gate retention keeps key rings safely attached',
      'Stonewashed surface hides everyday pocket scratches'
    ],
    features: [
      'Unibody Ti-6Al-4V Titanium Alloy construction',
      'Includes 2 matching flat titanium split rings (25mm & 18mm)',
      'Corrosion-proof, salt-water resistant, non-magnetic',
      'Smooth chamfered edge prevents snagging fabric'
    ],
    specifications: [
      { label: 'Dimensions', value: '6.2 cm × 2.6 cm × 0.4 cm' },
      { label: 'Weight', value: '16.2 grams' },
      { label: 'Material', value: 'Grade 5 Titanium' },
      { label: 'Finish', value: 'Tumbled Stonewashed Gray' }
    ],
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'
    ],
    is_featured: false,
    is_bestseller: false,
    in_stock: true,
    stock_count: 40,
    rating: 4.8,
    review_count: 11,
    created_at: '2026-02-22T10:00:00Z'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev-01',
    product_id: 'nx-01',
    customer_name: 'Ananya Sharma',
    rating: 5,
    title: 'Keeps bathroom counter completely dry',
    comment: 'The Diatomite tray genuinely works like magic. Faucet drips vanish in under a minute and the brass feet add a gorgeous understated look to our bathroom.',
    verified_purchase: true,
    created_at: '2026-02-20T14:30:00Z',
    location: 'Bengaluru'
  },
  {
    id: 'rev-02',
    product_id: 'nx-03',
    customer_name: 'Rohan Mehra',
    rating: 5,
    title: 'The build quality is exceptional',
    comment: 'Been using the coffee grinder every morning for pour overs. The grind consistency is on par with machines three times the price, and the weighted feel is superb.',
    verified_purchase: true,
    created_at: '2026-02-25T09:15:00Z',
    location: 'Mumbai'
  },
  {
    id: 'rev-03',
    product_id: 'nx-04',
    customer_name: 'Dr. Priya Nambiar',
    rating: 5,
    title: 'Authentic stone, feels wonderful on the jaw',
    comment: 'You can immediately tell this is real heavy volcanic stone. Warming it up slightly before evening skincare has helped significantly with tension.',
    verified_purchase: true,
    created_at: '2026-03-01T18:45:00Z',
    location: 'Kochi'
  }
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement_text: 'Free Delivery on every order!',
  announcement_enabled: true,
  free_shipping_threshold: 0,
  upi_id: 'nexora@upi',
  upi_name: 'NEXORA LIFESTYLE',
  upi_qr_image: '/upi-qr-code.jpg',
  support_phone: '+91 98765 43210',
  support_email: 'concierge@nexoralife.com',
  instagram_handle: '@nexora.official',
  email_notifications_enabled: true,
  emailjs_service_id: 'service_4p0rkzt',
  emailjs_template_id: 'template_r4oql89',
  emailjs_public_key: '5Tb3Jifn4sD-DpWaS',
};
