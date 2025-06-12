import supabase from './supaBase';

async function checkDatabase() {
  try {
    // Check bookings table
    console.log("Checking bookings table...");
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(3);
    
    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
    } else {
      console.log("Bookings sample:", bookings);
    }
    
    // Check guests table
    console.log("\nChecking guests table...");
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .limit(3);
    
    if (guestsError) {
      console.error("Error fetching guests:", guestsError);
    } else {
      console.log("Guests sample:", guests);
    }
    
    // Check cabins table
    console.log("\nChecking cabins table...");
    const { data: cabins, error: cabinsError } = await supabase
      .from('cabins')
      .select('*')
      .limit(3);
    
    if (cabinsError) {
      console.error("Error fetching cabins:", cabinsError);
    } else {
      console.log("Cabins sample:", cabins);
    }
    
    // Check a booking with its relationships
    console.log("\nChecking a booking with its relationships...");
    const { data: bookingWithRelations, error: relationsError } = await supabase
      .from('bookings')
      .select('*, guests(*), cabins(*)')
      .limit(1)
      .single();
    
    if (relationsError) {
      console.error("Error fetching booking with relations:", relationsError);
    } else {
      console.log("Booking with relations:", bookingWithRelations);
    }
    
  } catch (error) {
    console.error("Error checking database:", error);
  }
}

// Execute the function
checkDatabase();

export default checkDatabase; 