import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rijxrhtrnqpkaqoargus.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpanhyaHRybnFwa2Fxb2FyZ3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTY5ODksImV4cCI6MjA2NDYzMjk4OX0.4aWmKPCUxwRzFm-fqc6VoF-Jp33BPl3T0rbmIxERcjs";
const supabase = createClient(supabaseUrl, supabaseKey);

async function linkBookingsToGuests() {
  console.log('Starting to link bookings to guests...');
  
  try {
    // Get all guests
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, email, fullName');
    
    if (guestsError) {
      console.error('Error fetching guests:', guestsError);
      return;
    }
    
    console.log(`Found ${guests.length} guests in the database`);
    
    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, guestId');
    
    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return;
    }
    
    console.log(`Found ${bookings.length} bookings in the database`);
    
    // Update each booking with a guest ID if not already assigned
    let updateCount = 0;
    for (const booking of bookings) {
      if (!booking.guestId && guests.length > 0) {
        // Assign a random guest
        const randomGuest = guests[Math.floor(Math.random() * guests.length)];
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ guestId: randomGuest.id })
          .eq('id', booking.id);
        
        if (updateError) {
          console.error(`Error updating booking ${booking.id}:`, updateError);
        } else {
          console.log(`Updated booking ${booking.id} with guest ${randomGuest.fullName} (${randomGuest.id})`);
          updateCount++;
        }
      }
    }
    
    console.log(`Updated ${updateCount} bookings with guest IDs`);
    
    // Verify a booking with its guest
    const { data: verifyBooking, error: verifyError } = await supabase
      .from('bookings')
      .select('*, guests(*)')
      .limit(1)
      .single();
    
    if (verifyError) {
      console.error('Error verifying booking with guest:', verifyError);
    } else {
      console.log('Sample booking with guest:', verifyBooking);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the function
linkBookingsToGuests().catch(console.error); 