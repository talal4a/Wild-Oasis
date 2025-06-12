import supabase from './supaBase';
import { guests } from '../data/data-guests';
import { bookings } from '../data/data-bookings';

// Function to upload guests
async function uploadGuests() {
  console.log('Starting to upload guests...');
  console.log(`Total guests to upload: ${guests.length}`);
  
  // First check if guests already exist
  const { data: existingGuests, error: checkError } = await supabase
    .from('guests')
    .select('count');
  
  if (checkError) {
    console.error('Error checking existing guests:', checkError);
    return;
  }
  
  console.log('Existing guests count:', existingGuests);
  
  // Upload guests
  const { data, error } = await supabase.from('guests').upsert(
    guests.map(guest => ({
      fullName: guest.fullName,
      email: guest.email,
      nationality: guest.nationality,
      nationalID: guest.nationalID,
      countryFlag: guest.countryFlag
    })),
    { onConflict: 'email' }
  );
  
  if (error) {
    console.error('Error uploading guests:', error);
  } else {
    console.log('Guests uploaded successfully');
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
}

// Function to link bookings with guests
async function linkBookingsWithGuests() {
  console.log('Starting to link bookings with guests...');
  
  // Get all guests from the database
  const { data: guestsData, error: guestsError } = await supabase
    .from('guests')
    .select('id, email');
  
  if (guestsError) {
    console.error('Error fetching guests:', guestsError);
    return;
  }
  
  console.log(`Found ${guestsData.length} guests in the database`);
  
  // Get all bookings
  const { data: existingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, guestId');
  
  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
    return;
  }
  
  console.log(`Found ${existingBookings.length} bookings in the database`);
  
  // Update each booking with a random guest if not already assigned
  for (const booking of existingBookings) {
    if (!booking.guestId && guestsData.length > 0) {
      // Assign a random guest
      const randomGuest = guestsData[Math.floor(Math.random() * guestsData.length)];
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ guestId: randomGuest.id })
        .eq('id', booking.id);
      
      if (updateError) {
        console.error(`Error updating booking ${booking.id}:`, updateError);
      } else {
        console.log(`Updated booking ${booking.id} with guest ${randomGuest.id}`);
      }
    }
  }
  
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
}

// Execute the functions
async function main() {
  await uploadGuests();
  await linkBookingsWithGuests();
}

main().catch(console.error);

export { uploadGuests, linkBookingsWithGuests }; 