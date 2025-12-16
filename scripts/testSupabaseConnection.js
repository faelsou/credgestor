import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://avszitcisjexrjkbkxat.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3ppdGNpc2pleHJqa2JreGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzE2MjMsImV4cCI6MjA4MTQ0NzYyM30.AyOFyM8uScHLWdhc9diTsn9WM_2dlMc5m4-jfN_LOtU';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Erro ao conectar ao Supabase:', error.message);
      process.exit(1);
    }

    console.log('Conexão com Supabase bem-sucedida.');
    console.log('Sessão atual disponível:', Boolean(data.session));
  } catch (err) {
    console.error('Falha ao tentar conectar ao Supabase:', err);
    process.exit(1);
  }
}

main();
