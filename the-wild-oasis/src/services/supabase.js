import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://rijxrhtrnqpkaqoargus.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpanhyaHRybnFwa2Fxb2FyZ3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTY5ODksImV4cCI6MjA2NDYzMjk4OX0.4aWmKPCUxwRzFm-fqc6VoF-Jp33BPl3T0rbmIxERcjs";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
