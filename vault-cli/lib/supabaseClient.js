// lib/supabaseClient.js

// import supabase and your config reader
const { createClient } = require('@supabase/supabase-js');
const { readConfig } = require('./config');

// supabase project URL and anon key
const SUPABASE_URL = 'https://ojvqwqfreaaajxzmcmla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdnF3cWZyZWFhYWp4em1jbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjEyMjAsImV4cCI6MjA1OTg5NzIyMH0.ZywiEWREdwb5eC9c4WpjrAwkscznW6yCB9C6hOqwlAg'; 

// create a Supabase client using refresh token
async function getSupabaseClient() {
  // read the .vault/config.json file
  const config = await readConfig();

  // if the user hasn't imported token, show an error
  if (!config.refresh_token) {
    throw new Error('No refresh token found. Please run: kvault import-token');
  }

  // initialize supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false // don't auto-persist session in memory
    }
  });

  // try to refresh session using saved refresh token
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: config.refresh_token
  });

  // if token is invalid or expired, error out
  if (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }

  // return authenticated client and user info
  return {
    supabase,
    user: data.user,
    access_token: data.session.access_token
  };
}

module.exports = { getSupabaseClient };
