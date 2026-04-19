CREATE TABLE IF NOT EXISTS pandit_blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pandit_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_full_day BOOLEAN DEFAULT false,
  slots TEXT[] DEFAULT '{}', -- Array of specific blocked time slots e.g. ["10:00", "11:00"]
  reason VARCHAR(50) DEFAULT 'personal' CHECK (reason IN ('personal', 'booked', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pandit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_pandit_blocked_dates_pandit ON pandit_blocked_dates(pandit_id);
CREATE INDEX IF NOT EXISTS idx_pandit_blocked_dates_date ON pandit_blocked_dates(date);

-- FIX FOR RLS ERROR:
-- Disable Row Level Security so the Node.js backend can insert/update freely.
-- (Since your backend handles the authentication/security via JWTs before calling Supabase)
ALTER TABLE pandit_blocked_dates DISABLE ROW LEVEL SECURITY;

-- Add notes column if table already exists
ALTER TABLE pandit_blocked_dates ADD COLUMN IF NOT EXISTS notes TEXT;

-- If you prefer to keep RLS enabled, uncomment and run this instead:
-- CREATE POLICY "Enable all operations for authenticated users" ON pandit_blocked_dates FOR ALL USING (true) WITH CHECK (true);
