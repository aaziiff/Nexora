import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mbvhdbxfkpqjwwsooths.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_QCifLh65f5_eM_Eq-trYJQ_7dv53BdO';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  !supabaseUrl.includes('example')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

if (typeof window !== 'undefined') {
  console.log(
    isSupabaseConfigured
      ? `[NEXORA DB] Connected to Supabase Cloud Database: ${supabaseUrl}`
      : '[NEXORA DB] Running in Offline LocalStorage Mode'
  );
}
