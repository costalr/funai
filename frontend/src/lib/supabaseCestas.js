import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_CESTAS_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_CESTAS_ANON_KEY;

console.log("🌽 Supabase Cestas URL:", supabaseUrl);
console.log("🔐 Supabase Anon Key (fim):", supabaseAnonKey?.slice(-6));

export const supabaseCestas = createClient(supabaseUrl, supabaseAnonKey);
