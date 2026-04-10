-- ============================================================
-- E-PANDIT — Complete Supabase Database Schema
-- ============================================================
-- Run this entire file in Supabase SQL Editor (one-shot setup)
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- Stores both Users and Pandits (role-based)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'pandit')),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  -- Location
  state VARCHAR(100),
  district VARCHAR(100),
  pin_code VARCHAR(6),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  -- Pandit-specific (NULL for regular users)
  specializations TEXT[],
  experience_years INTEGER,
  languages TEXT[],
  price_per_pooja INTEGER,
  about TEXT,
  -- Status
  is_online BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  -- Preferences (for users)
  preferred_poojas TEXT[],
  preferred_languages TEXT[],
  notify_booking_updates BOOLEAN DEFAULT true,
  notify_promotions BOOLEAN DEFAULT false,
  notify_reminders BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. BOOKINGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pandit_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pooja_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','accepted','arriving','in_progress','completed','cancelled')),
  -- Location
  user_address TEXT,
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  pandit_lat DECIMAL(10, 8),
  pandit_lng DECIMAL(11, 8),
  -- Scheduling
  scheduled_date DATE,
  scheduled_time TIME,
  -- Payment
  amount INTEGER NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','refunded')),
  payment_method VARCHAR(20) DEFAULT 'cash'
    CHECK (payment_method IN ('cash','upi','card','wallet')),
  -- Notes
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by VARCHAR(10) CHECK (cancelled_by IN ('user', 'pandit')),
  -- Timestamps
  accepted_at TIMESTAMPTZ,
  arriving_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. REVIEWS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pandit_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. NOTIFICATIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'booking_request','booking_accepted','pandit_arriving',
    'pooja_started','pooja_completed','booking_cancelled',
    'review_received','welcome','system'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  channel VARCHAR(10) DEFAULT 'app' CHECK (channel IN ('app', 'email', 'sms')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_online ON profiles(is_online) WHERE role = 'pandit';
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pandit ON bookings(pandit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_pandit ON reviews(pandit_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- ── ENABLE REALTIME ─────────────────────────────────────────
-- Run these in Supabase Dashboard > Database > Replication
-- OR use the following:
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- SETUP COMPLETE!  
-- ============================================================
-- Next steps:
-- 1. Go to Supabase Dashboard > Settings > API
-- 2. Copy your Project URL and anon/public key
-- 3. Paste them in your BACKEND/.env file
-- 4. Enable Realtime in Dashboard > Database > Replication
--    for tables: bookings, notifications
-- ============================================================
