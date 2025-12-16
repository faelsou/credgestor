import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://avszitcisjexrjkbkxat.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3ppdGNpc2pleHJqa2JreGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzE2MjMsImV4cCI6MjA4MTQ0NzYyM30.AyOFyM8uScHLWdhc9diTsn9WM_2dlMc5m4-jfN_LOtU';

export const SUPABASE_SERVICE_ROLE_KEY =
  import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3ppdGNpc2pleHJqa2JreGF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg3MTYyMywiZXhwIjoyMDgxNDQ3NjIzfQ.p-3mHE0HZ719ZLfOTjTeXSLC9hmlmmFfdtBZxt4qLtY';

const supabaseUrl =
  // Prefer valores de ambiente do Vite, mas faça fallback para variáveis Node em scripts utilitários.
  import.meta.env?.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type SupabaseClient = typeof supabase;
