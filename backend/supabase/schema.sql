-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  eco_points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  membership_tier TEXT DEFAULT 'bronze',
  user_qr_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Item Listings (Swap/Rent)
CREATE TABLE IF NOT EXISTS item_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  status TEXT DEFAULT 'available', -- available, pending, swapped, rented
  listing_type TEXT NOT NULL, -- 'swap', 'rent'
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Swap Requests
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES item_listings(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Rent Requests
CREATE TABLE IF NOT EXISTS rent_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES item_listings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Carbon Cart Items
CREATE TABLE IF NOT EXISTS carbon_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  estimated_carbon_kg NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Food Listings
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quantity TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  urgency_score INTEGER DEFAULT 0, -- Higher is more urgent
  image_url TEXT,
  status TEXT DEFAULT 'available', -- available, claimed, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Rescue Claims
CREATE TABLE IF NOT EXISTS rescue_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claimer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_listing_id UUID REFERENCES food_listings(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Upcycle Materials
CREATE TABLE IF NOT EXISTS upcycle_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  description TEXT,
  quantity TEXT NOT NULL,
  weight_kg NUMERIC,
  image_url TEXT,
  status TEXT DEFAULT 'available', -- available, claimed
  reuse_potential_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Sustainability Metrics
CREATE TABLE IF NOT EXISTS sustainability_metrics (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_carbon_saved_kg NUMERIC DEFAULT 0.0,
  items_reused INTEGER DEFAULT 0,
  water_saved_liters NUMERIC DEFAULT 0.0,
  total_eco_points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Reward Badges
CREATE TABLE IF NOT EXISTS reward_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_name TEXT UNIQUE NOT NULL,
  description TEXT,
  required_points INTEGER DEFAULT 0,
  icon_url TEXT
);

-- 11. User Badges
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES reward_badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(user_id, badge_id)
);

-- 12. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
