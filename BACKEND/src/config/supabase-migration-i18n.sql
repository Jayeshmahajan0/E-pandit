-- 1. Add translation fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS about_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS regional_traditions_translations JSONB DEFAULT '{}'::jsonb;

-- 2. Add translation fields to notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS message_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS title_translations JSONB DEFAULT '{}'::jsonb;
