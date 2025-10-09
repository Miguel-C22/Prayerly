import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase Client
 *
 * This client uses the service role key and bypasses Row Level Security (RLS).
 *
 * ⚠️ IMPORTANT SECURITY NOTES:
 * - Only use this client for trusted server-side operations
 * - NEVER expose this client or its key to the browser/client
 * - This client has full database access regardless of RLS policies
 *
 * Use cases:
 * - Cron jobs that need cross-user access
 * - Admin operations
 * - System-level tasks
 *
 * For regular user operations, use the standard server or client Supabase clients.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
