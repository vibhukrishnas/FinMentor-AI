import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback logic for Hackathon demo if keys aren't set yet
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock Wrapper Functions that either call Supabase or simulate the delay
export const mockableDbReq = async (operation) => {
  if (isSupabaseConfigured) {
    return await operation(supabase);
  }
  
  // Simulate network latency if offline
  await new Promise(resolve => setTimeout(resolve, 800));
  return { data: null, error: null, mocked: true };
};

export const IS_DB_ACTIVE = isSupabaseConfigured;
