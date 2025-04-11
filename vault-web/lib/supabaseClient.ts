// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojvqwqfreaaajxzmcmla.supabase.co';
const supabaseAnonKey= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdnF3cWZyZWFhYWp4em1jbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjEyMjAsImV4cCI6MjA1OTg5NzIyMH0.ZywiEWREdwb5eC9c4WpjrAwkscznW6yCB9C6hOqwlAg'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
