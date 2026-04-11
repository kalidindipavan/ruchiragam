/**
 * @file db.js
 * @description Supabase client initialization.
 * Uses service_role key for server-side operations (bypasses RLS when needed).
 */

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Service-role client: full DB access (server-side only, never exposed to client)
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client: used for user-context operations respecting RLS
const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

module.exports = { supabase, supabaseAnon };
