import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_ASSISTENCIA_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ASSISTENCIA_ANON_KEY;
console.log("URL:", import.meta.env.VITE_SUPABASE_ASSISTENCIA_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_ASSISTENCIA_ANON_KEY);

export const supabaseAssistencia = createClient(supabaseUrl, supabaseAnonKey);
