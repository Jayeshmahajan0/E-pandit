const { createClient } = require("@supabase/supabase-js");

/*
 * Supabase Configuration
 * ----------------------
 * To set up:
 * 1. Go to https://supabase.com and create a new project
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Create a .env file in the BACKEND root (copy from .env.example)
 * 4. Paste your SUPABASE_URL and SUPABASE_ANON_KEY
 *
 * Required Database Tables (run in Supabase SQL Editor):
 * 
 * CREATE TABLE users (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   full_name VARCHAR(255) NOT NULL,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   phone VARCHAR(15),
 *   password_hash VARCHAR(255) NOT NULL,
 *   date_of_birth DATE,
 *   gender VARCHAR(20),
 *   avatar_url TEXT,
 *   is_verified BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE TABLE user_locations (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   state VARCHAR(100) NOT NULL,
 *   district VARCHAR(100) NOT NULL,
 *   pin_code VARCHAR(6),
 *   location_enabled BOOLEAN DEFAULT true,
 *   latitude DECIMAL(10, 8),
 *   longitude DECIMAL(11, 8),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE TABLE user_preferences (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   preferred_poojas TEXT[],
 *   preferred_languages TEXT[],
 *   notify_booking_updates BOOLEAN DEFAULT true,
 *   notify_promotions BOOLEAN DEFAULT false,
 *   notify_reminders BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "your_supabase_url_here") {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("   Supabase client initialized successfully");
} else {
  console.log(
    "     Supabase not configured — running with mock data. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env"
  );
}

module.exports = supabase;
