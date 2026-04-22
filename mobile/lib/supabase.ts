import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://pydjvepklcfdxmjcptme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZGp2ZXBrbGNmZHhtamNwdG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODQ0ODksImV4cCI6MjA5MjQ2MDQ4OX0.Ge_ehJqmS1-EbptbymT0BHLO6MiTTtDAyINgi_K113s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:           AsyncStorage,
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: false,
  },
});