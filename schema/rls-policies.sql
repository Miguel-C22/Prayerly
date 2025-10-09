
-- ============================================================================
-- PRAYERS TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "Users can view their own prayers"
ON prayers
FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own prayers"
ON prayers
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own prayers"
ON prayers
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own prayers"
ON prayers
FOR DELETE
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- REFLECTIONS TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "Users can view their own reflections"
ON reflections
FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own reflections"
ON reflections
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reflections"
ON reflections
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reflections"
ON reflections
FOR DELETE
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- REMINDERS TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "Users can view their own reminders"
ON reminders
FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own reminders"
ON reminders
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reminders"
ON reminders
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reminders"
ON reminders
FOR DELETE
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- REMINDER_LOGS TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "Users can view their own reminder logs"
ON reminder_logs
FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own reminder logs"
ON reminder_logs
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reminder logs"
ON reminder_logs
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reminder logs"
ON reminder_logs
FOR DELETE
USING ((select auth.uid()) = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
--
-- After running this migration, verify:
--
-- 1. All policies are recreated:
--    SELECT schemaname, tablename, policyname, cmd
--    FROM pg_policies
--    WHERE schemaname = 'public'
--    ORDER BY tablename, cmd;
--
-- 2. Check Supabase Advisors - warnings should be gone
--
-- 3. Test your app - all functionality should work the same
--
-- ============================================================================

-- ============================================================================
-- DROP OLD POLICIES
-- ============================================================================

-- -- Drop prayers policies
-- DROP POLICY IF EXISTS "Users can view their own prayers" ON prayers;
-- DROP POLICY IF EXISTS "Users can insert their own prayers" ON prayers;
-- DROP POLICY IF EXISTS "Users can update their own prayers" ON prayers;
-- DROP POLICY IF EXISTS "Users can delete their own prayers" ON prayers;

-- -- Drop reflections policies
-- DROP POLICY IF EXISTS "Users can view their own reflections" ON reflections;
-- DROP POLICY IF EXISTS "Users can insert their own reflections" ON reflections;
-- DROP POLICY IF EXISTS "Users can update their own reflections" ON reflections;
-- DROP POLICY IF EXISTS "Users can delete their own reflections" ON reflections;

-- -- Drop reminders policies
-- DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
-- DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
-- DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
-- DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

-- -- Drop reminder_logs policies
-- DROP POLICY IF EXISTS "Users can view their own reminder logs" ON reminder_logs;
-- DROP POLICY IF EXISTS "Users can insert their own reminder logs" ON reminder_logs;
-- DROP POLICY IF EXISTS "Users can update their own reminder logs" ON reminder_logs;
-- DROP POLICY IF EXISTS "Users can delete their own reminder logs" ON reminder_logs;