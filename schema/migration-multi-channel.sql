-- Migration: Change channel from text to text[] to support multiple notification channels
-- This allows users to receive reminders via email, push, or both

-- Step 1: Change the column type from text to text[]
ALTER TABLE reminders
ALTER COLUMN channel TYPE text[]
USING CASE
  WHEN channel IS NULL OR channel = '' THEN ARRAY[]::text[]
  ELSE ARRAY[channel]::text[]
END;

-- Step 2: Update existing reminders to have email as default channel
UPDATE reminders
SET channel = ARRAY['email']::text[]
WHERE channel IS NULL OR channel = ARRAY[]::text[];

-- Step 3: Add a comment to document the change
COMMENT ON COLUMN reminders.channel IS 'Array of notification channels: email, push, sms (future)';
