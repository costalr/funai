import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_CESTAS_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_CESTAS_ANON_KEY;

export const supabaseCestas = createClient(supabaseUrl, supabaseAnonKey);
