import { createClient } from '@supabase/supabase-js';

// Usamos import.meta.env que es lo que Vite entiende
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);