-- ==========================================================
-- NEXORA DATABASE SCHEMA & SEED SCRIPT (Supabase PostgreSQL)
-- ==========================================================
-- Run this complete script in your Supabase Project -> SQL Editor

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. CREATE TABLES
create table if not exists categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  image text,
  item_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists products (
  id text primary key default ('nx-' || substr(uuid_generate_v4()::text, 1, 8)),
  slug text unique not null,
  name text not null,
  tagline text not null,
  category text references categories(slug) on delete set null,
  category_name text,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  discount text,
  description text not null,
  story text,
  benefits jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb,
  specifications jsonb default '[]'::jsonb,
  images text[] default '{}',
  is_featured boolean default false,
  is_bestseller boolean default false,
  in_stock boolean default true,
  stock_count integer default 10,
  rating numeric(3,2) default 5.0,
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists orders (
  id text primary key default ('ord-' || substr(uuid_generate_v4()::text, 1, 8)),
  order_number text unique not null,
  customer jsonb not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) default 0,
  discount_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  payment_method text check (payment_method in ('COD', 'UPI')) not null,
  payment_status text check (payment_status in ('pending', 'verified', 'failed')) default 'pending',
  upi_reference_id text,
  order_status text default 'ORDER PLACED' not null,
  courier_name text,
  tracking_number text,
  tracking_url text,
  estimated_delivery text,
  delivered_at timestamp with time zone,
  return_request jsonb,
  status_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists reviews (
  id text primary key default ('rev-' || substr(uuid_generate_v4()::text, 1, 8)),
  product_id text references products(id) on delete cascade,
  customer_name text not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  title text not null,
  comment text not null,
  verified_purchase boolean default true,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists site_settings (
  id integer primary key default 1,
  announcement_text text default 'Free Delivery on every order!',
  announcement_enabled boolean default true,
  free_shipping_threshold numeric(10,2) default 0,
  upi_id text default 'nexora@upi',
  upi_name text default 'NEXORA LIFESTYLE',
  upi_qr_image text default '/upi-qr-code.jpg',
  support_phone text default '+91 98765 43210',
  support_email text default 'concierge@nexoralife.com',
  instagram_handle text default '@nexora.official',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table site_settings enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public can read categories" on categories;

drop policy if exists "Public can read products" on products;
drop policy if exists "Public can insert products" on products;
drop policy if exists "Public can update products" on products;
drop policy if exists "Public can delete products" on products;
drop policy if exists "Public can manage products" on products;

drop policy if exists "Public can read reviews" on reviews;
drop policy if exists "Public can submit reviews" on reviews;

drop policy if exists "Public can read site settings" on site_settings;
drop policy if exists "Public can update site settings" on site_settings;
drop policy if exists "Public can insert site settings" on site_settings;
drop policy if exists "Public can update site_settings" on site_settings;

drop policy if exists "Public can read orders" on orders;
drop policy if exists "Public can create orders" on orders;
drop policy if exists "Public can update orders" on orders;
drop policy if exists "Public can delete orders" on orders;
drop policy if exists "Public can read own order by number" on orders;

-- Set up permissive policies with public and authenticated access
create policy "Public can read categories" on categories for select using (true);

create policy "Public can read products" on products for select using (true);
create policy "Public can insert products" on products for insert with check (true);
create policy "Public can update products" on products for update using (true);
create policy "Public can delete products" on products for delete using (true);

create policy "Public can read reviews" on reviews for select using (true);
create policy "Public can submit reviews" on reviews for insert with check (true);

create policy "Public can read site settings" on site_settings for select using (true);
create policy "Public can update site settings" on site_settings for update using (true);
create policy "Public can insert site settings" on site_settings for insert with check (true);

create policy "Public can read orders" on orders for select using (true);
create policy "Public can create orders" on orders for insert with check (true);
create policy "Public can update orders" on orders for update using (true);
create policy "Public can delete orders" on orders for delete using (true);

-- 4. INSERT SEED CATEGORIES
insert into categories (id, slug, name, tagline, description, image, item_count)
values 
  ('cat-home', 'home', 'HOME', 'Calm spaces, organized living.', 'Thoughtfully designed organizers, desk accents, and ambient lifestyle essentials that bring quiet order to your space.', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop', 6),
  ('cat-care', 'care', 'CARE', 'Elevated personal rituals.', 'Minimalist facial tools, scalp massaging accessories, and natural grooming tools built for mindful morning and evening routines.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', 5),
  ('cat-kitchen', 'kitchen', 'KITCHEN', 'Simple tools, daily joy.', 'Ergonomic culinary accessories, airtight borosilicate containers, and precision counter essentials crafted for everyday ease.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop', 6),
  ('cat-bath', 'bath', 'BATH', 'Sensory everyday sanctuary.', 'Diatomite quick-dry stone trays, amber glass refill dispensers, and soft waffle textiles for a tranquil bath experience.', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1200&auto=format&fit=crop', 4),
  ('cat-everyday', 'everyday', 'EVERYDAY', 'Smart utilities on the move.', 'Compact daily carry accessories, cable organizers, magnetic key anchors, and smart utility tools you will reach for daily.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop', 5)
on conflict (slug) do nothing;

-- 5. INSERT SEED PRODUCTS
insert into products (id, slug, name, tagline, category, category_name, price, original_price, discount, description, story, benefits, features, specifications, images, is_featured, is_bestseller, in_stock, stock_count, rating, review_count)
values
  ('nx-01', 'diatomite-quick-dry-stone-tray', 'Diatomite Fast-Dry Stone Caddy', 'Instant-absorbing natural stone counter dock', 'bath', 'BATH', 1199, 1599, '25% OFF', 'Engineered from ultra-absorbent natural fossilized diatomaceous earth, this minimalist stone caddy evaporates standing water within 60 seconds, keeping sinks and countertops pristine.', 'We were tired of damp, mildew-prone silicone mats around bathroom and kitchen faucets. The Diatomite Fast-Dry Stone Caddy harnesses microscopic pores to instantly draw water away from soap bottles, tumblers, and toothbrushes into ambient air.', '["Absorbs and dissipates water droplets within seconds", "Naturally antibacterial and mildew-resistant", "Solid brushed brass elevation feet prevent surface pooling", "Zero synthetic chemicals or plastic waste"]'::jsonb, '["100% natural organic diatomaceous mineral composite", "Includes 4 corrosion-resistant brass leveling pads", "Matte stone texture with gentle rounded bevels", "Easy to refresh with included natural sanding buff"]'::jsonb, '[{"label": "Dimensions", "value": "28 cm × 12 cm × 2.5 cm"}, {"label": "Material", "value": "Natural Diatomite Earth + Solid Brass"}]'::jsonb, array['https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop'], true, true, true, 34, 4.9, 18),
  ('nx-02', 'sculpted-solid-brass-incense-dock', 'Precision Solid Brass Burner & Ash Well', 'Heavyweight monolith for quiet evening rituals', 'home', 'HOME', 1499, 1899, '21% OFF', 'Machined from a single cylinder of solid brass, this understated dock holds standard and Japanese coreless incense sticks with effortless poise while gathering falling ash cleanly.', 'Creating a moment of calm shouldn’t leave a mess on your side table. We designed a substantial, low-profile dock with a weighted center of gravity that feels timeless and sculptural.', '["Substantial 380g weight ensures complete stability", "Deep parabolic reservoir contains all micro ash"]'::jsonb, '["CNC milled solid brass with satin micro-brushing", "Protective natural cork underlay to protect fine wood surfaces"]'::jsonb, '[{"label": "Weight", "value": "380 grams"}, {"label": "Material", "value": "C36000 Solid Brass & Natural Cork"}]'::jsonb, array['https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop'], true, false, true, 19, 4.8, 12),
  ('nx-03', 'ergonomic-ceramic-burr-coffee-grinder', 'Tactile Hand Coffee Mill with Hexagonal Grip', 'Uniform particle control for contemplative mornings', 'kitchen', 'KITCHEN', 2299, 2899, '20% OFF', 'Anodized aerospace aluminum body with 420 stainless steel conical burrs. Smooth dual-bearing rotation produces consistent espresso, pour-over, and French press grounds with whisper-quiet tactile feedback.', 'Mornings are too precious for screeching electric motors. This hand mill turns the preparation of your morning cup into a sensory ritual of precision and aroma.', '["Dual-bearing stabilization eliminates burr wobble", "Stepped micro-click grind dial for precision extraction"]'::jsonb, '["CNC 38mm 420 High-Carbon Stainless Steel Conical Burrs", "Textured knurled grip prevents hand slipping"]'::jsonb, '[{"label": "Capacity", "value": "30g hopper & catch cup"}, {"label": "Weight", "value": "510 grams"}]'::jsonb, array['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop'], true, true, true, 22, 5.0, 27),
  ('nx-04', 'sculpting-bian-stone-facial-guasha', 'Thermal Bian Stone Contouring Tool', 'Mineral-rich resonance for facial tension relief', 'care', 'CARE', 899, 1199, '25% OFF', 'Carved from authentic volcanic Bian stone containing over 40 trace minerals, this ergonomic tool naturally retains warmth to stimulate lymphatic drainage and soothe jaw clenching.', 'Modern screen time leaves daily tension accumulated in the forehead, temples, and jawline. This Bian stone contours naturally along facial bone structure.', '["Relieves facial muscular tension and brow tightness", "Encourages natural blood circulation and lymphatic drainage"]'::jsonb, '["Natural Sibin Bian volcanic stone composition", "Hand-polished satin edge that glides effortlessly with facial oil"]'::jsonb, '[{"label": "Material", "value": "100% Authentic Sibin Bian Stone"}, {"label": "Weight", "value": "95 grams"}]'::jsonb, array['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1000&auto=format&fit=crop'], true, true, true, 45, 4.9, 31),
  ('nx-05', 'modular-magnetic-desk-cable-anchor', 'Cast Aluminum Magnetic Cable Orbit', 'Zero-drop wire organization for clean desks', 'everyday', 'EVERYDAY', 749, 999, '25% OFF', 'Heavy cast-alloy base with 3 snap-on magnetic collars that keep charging cables, laptop cords, and headphones anchored cleanly on your nightstand or workspace.', 'Hunting for charging cables that slipped behind your desk is a micro-frustration. We built a weighted geometric dock with satisfying magnetic snap-actions.', '["Weighted metal base stays securely in place", "Collars fit USB-C, Lightning, braided, and audio cables"]'::jsonb, '["Cast zinc-aluminum alloy with weighted internal core", "Includes 3 modular neodymium magnetic cable collars"]'::jsonb, '[{"label": "Base Dimensions", "value": "8.5 cm × 2.2 cm × 1.8 cm"}, {"label": "Weight", "value": "180 grams"}]'::jsonb, array['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop'], false, true, true, 50, 4.7, 14),
  ('nx-06', 'amber-glass-dispenser-pair', 'Refillable Amber Glass Soap & Lotion Flacons', 'Substantial apothecary glass with stainless pump heads', 'bath', 'BATH', 999, 1299, '23% OFF', 'Set of two 500ml thick-walled amber apothecary glass dispensers fitted with matte black stainless steel pumps. Designed to reduce single-use plastic while elevating your basin.', 'Loud branded plastic bottles clutter the eye. These apothecary flacons protect light-sensitive soaps and oils while creating a tranquil, unified vanity.', '["UV-blocking amber glass preserves organic oils and soaps", "Smooth, non-dripping metal spring-lock pump action"]'::jsonb, '["2 × 500ml Pharmaceutical grade lead-free glass bottles", "304 Stainless steel matte charcoal pump heads"]'::jsonb, '[{"label": "Capacity", "value": "500 ml each (Set of 2)"}]'::jsonb, array['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop'], false, false, true, 28, 4.8, 19)
on conflict (slug) do nothing;

-- 6. INSERT DEFAULT SITE SETTINGS
insert into site_settings (id, announcement_text, announcement_enabled, free_shipping_threshold, upi_id, upi_name, support_phone, support_email, instagram_handle)
values (1, 'Free Delivery on every order!', true, 0, 'nexora@upi', 'NEXORA LIFESTYLE', '+91 98765 43210', 'concierge@nexoralife.com', '@nexora.official')
on conflict (id) do nothing;

-- 7. INSERT SAMPLE DEMO ORDER FOR TRACKING
insert into orders (id, order_number, customer, items, subtotal, shipping_fee, discount_amount, total_amount, payment_method, payment_status, upi_reference_id, order_status, courier_name, tracking_number, tracking_url, estimated_delivery, status_history)
values (
  'ord-9021',
  'NX-89210',
  '{"name": "Arjun Sen", "email": "arjun@example.com", "phone": "+91 9876543210", "address": "14 Indiranagar 100ft Road", "city": "Bengaluru", "state": "Karnataka", "pincode": "560038"}'::jsonb,
  '[{"product_id": "nx-01", "product_name": "Diatomite Fast-Dry Stone Caddy", "price": 1199, "quantity": 1, "image": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop"}]'::jsonb,
  1199,
  0,
  0,
  1199,
  'UPI',
  'verified',
  'UPI-9830219482',
  'PROCESSING',
  'BlueDart Express',
  'BD89201948IN',
  'https://www.bluedart.com',
  '3-4 business days',
  '[{"status": "ORDER PLACED", "timestamp": "2026-02-28T10:00:00Z", "note": "Order placed by customer via UPI"}, {"status": "CONFIRMED", "timestamp": "2026-02-28T14:30:00Z", "note": "UPI Payment verified by concierge"}, {"status": "PROCESSING", "timestamp": "2026-03-01T09:00:00Z", "note": "Packed in eco-friendly protective packaging"}]'::jsonb
)
on conflict (order_number) do nothing;

-- 8. ENABLE SUPABASE REALTIME BROADCASTING
-- Enables WebSocket push notifications so placing an order on a phone updates the Mac Admin live
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table products;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table reviews;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'site_settings'
  ) then
    alter publication supabase_realtime add table site_settings;
  end if;
end $$;
