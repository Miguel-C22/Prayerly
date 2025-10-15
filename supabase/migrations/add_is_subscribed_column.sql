-- Add is_subscribed column to push_subscriptions table
ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT true;

-- Set existing records to subscribed
UPDATE push_subscriptions SET is_subscribed = true WHERE is_subscribed IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_subscribed
ON push_subscriptions(user_id, is_subscribed);
