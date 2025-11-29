import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgtbjojwozyogmkwxmwj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndGJqb2p3b3p5b2dta3d4bXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjQ4MjEsImV4cCI6MjA3OTk0MDgyMX0.bhLxuBBlXony_hK9LUmV0-U4xTf4zGPNMpsl09nTrSI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);