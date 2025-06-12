import { createClient } from '@supabase/supabase-js';
import { guests } from './src/data/data-guests.js';

const supabaseUrl = "https://rijxrhtrnqpkaqoargus.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpanhyaHRybnFwa2Fxb2FyZ3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTY5ODksImV4cCI6MjA2NDYzMjk4OX0.4aWmKPCUxwRzFm-fqc6VoF-Jp33BPl3T0rbmIxERcjs";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableColumns() {
  try {
    // First, let's check what columns actually exist in the guests table
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'guests' });
    
    if (error) {
      console.error('Error checking table columns:', error);
      
      // Try a different approach - just fetch one row to see the structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('guests')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error fetching sample data:', sampleError);
      } else {
        console.log('Sample data structure:', sampleData);
      }
    } else {
      console.log('Table columns:', data);
    }
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

async function uploadGuests() {
  console.log('Starting to upload guests...');
  console.log(`Total guests to upload: ${guests.length}`);
  
  try {
    // Try a simple insert instead of upsert
    for (const guest of guests) {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          fullName: guest.fullName,
          email: guest.email
        });
      
      if (error) {
        console.error(`Error inserting guest ${guest.fullName}:`, error);
      } else {
        console.log(`Successfully inserted guest ${guest.fullName}`);
      }
    }
    
    // Verify guests were uploaded
    const { data: verifyGuests, error: verifyError } = await supabase
      .from('guests')
      .select('*')
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying guests:', verifyError);
    } else {
      console.log('Sample guests in database:', verifyGuests);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the function
uploadGuests().catch(console.error); 