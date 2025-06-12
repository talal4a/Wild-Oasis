import supabase from "./supaBase";

export async function getGuests() {
  try {
    const { data, error } = await supabase.from("guests").select("*");
    
    if (error) {
      throw new Error("Guests could not be loaded");
    }
    
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch guests: ${err.message}`);
  }
}

export async function createGuests(newGuest) {
  try {
    // Remove nationalID if it exists in the newGuest object
    const { nationalID, ...guestWithoutNationalID } = newGuest;
    
    // Insert the guest without the nationalID field
    const { data, error } = await supabase
      .from("guests")
      .insert([guestWithoutNationalID])
      .select();
    
    if (error) {
      throw new Error("Guest could not be created");
    }
    
    return data;
  } catch (err) {
    throw new Error(`Failed to create guest: ${err.message}`);
  }
} 