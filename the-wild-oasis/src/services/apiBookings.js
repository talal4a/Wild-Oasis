import { getToday } from "../utils/helpers";
import supabase from "./supaBase";
import { bookings } from "../data/data-bookings";
import { guests as mockGuests } from "../data/data-guests";
export async function getBookings({ filter, sortBy } = {}) {
  console.log("Connecting to Supabase to fetch bookings...");
  console.log("Query params:", { filter, sortBy });
  
  try {
    let query = supabase.from("bookings").select("*, cabins(*), guests(*)");
    
    // Apply filter if provided
    if (filter) {
      query = query.eq(filter.field, filter.value);
    }
    
    // Apply sorting if provided
    if (sortBy) {
      const { field, direction } = sortBy;
      query = query.order(field, { ascending: direction === "asc" });
    }
    
    console.log("Executing Supabase query...");
    const { data, error } = await query;
    
    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Bookings could not be loaded");
    }
    
    console.log(`Successfully fetched ${data?.length || 0} bookings`);
    
    // If we have data but the guest information is missing, add it from mock data
    if (data && data.length > 0) {
      console.log("Processing booking data to ensure complete guest information");
      const enhancedData = data.map((booking) => {
        // Process guests data
        if (Array.isArray(booking.guests) && booking.guests.length > 0) {
          booking.guests = booking.guests[0];
        } else if (!booking.guests || Object.keys(booking.guests).length === 0) {
          const mockGuest = booking.guestId && booking.guestId <= mockGuests.length
            ? mockGuests[booking.guestId - 1]
            : { fullName: "Unknown Guest", email: "-" };
          
          booking.guests = mockGuest;
        }
        
        // Process cabins data
        if (Array.isArray(booking.cabins) && booking.cabins.length > 0) {
          booking.cabins = booking.cabins[0];
        } else if (!booking.cabins || Object.keys(booking.cabins).length === 0) {
          booking.cabins = { name: `Cabin ${booking.cabinId || "Unknown"}` };
        }
        
        return booking;
      });
      
      return enhancedData;
    }
    
    return data || [];
  } catch (err) {
    console.error("Error in getBookings:", err);
    throw new Error(`Failed to fetch bookings: ${err.message}`);
  }
}

export async function getBooking(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .eq("id", id)
    .single();
    
  if (error) {
    console.error("Error fetching booking:", error);
    throw new Error("Booking not found");
  }

  // Process the data to ensure consistent structure
  if (data) {
    // Handle guests data
    if (Array.isArray(data.guests) && data.guests.length > 0) {
      data.guests = data.guests[0];
    } else if (!data.guests) {
      // Try to find a guest from mock data
      const mockGuest = data.guestId && data.guestId <= mockGuests.length
        ? mockGuests[data.guestId - 1]
        : { fullName: "Unknown Guest", email: "-" };
      
      data.guests = mockGuest;
    }
    
    // Handle cabins data
    if (Array.isArray(data.cabins) && data.cabins.length > 0) {
      data.cabins = data.cabins[0];
    } else if (!data.cabins) {
      data.cabins = { name: `Cabin ${data.cabinId || "Unknown"}` };
    }
    
    console.log("Processed booking data:", data);
  }

  return data;
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
export async function getBookingsAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, totalPrice, extrasPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    // .select('*')
    .select("*, guests(fullName)")
    .gte("startDate", date)
    .lte("startDate", getToday());

  if (error) {
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName, nationality, countryFlag)")
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${getToday()}),and(status.eq.checked-in,endDate.eq.${getToday()})`
    )
    .order("created_at");

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    throw new Error("Bookings could not get loaded");
  }
  return data;
}

export async function updateBooking(id, obj) {
  const { data, error } = await supabase
    .from("bookings")
    .update(obj)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Booking could not be updated");
  }
  return data;
}

export async function deleteBooking(id) {
  // REMEMBER RLS POLICIES
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    throw new Error("Booking could not be deleted");
  }
  return data;
}

export async function createBookings() {
  try {
    console.log("Starting to create bookings...");
    
    // Fetch all guests with their emails and IDs
    const { data: guestsData, error: guestsError } = await supabase
      .from("guests")
      .select("id, email, fullName");
      
    if (guestsError) {
      console.error("Error fetching guests:", guestsError);
      throw new Error("Could not fetch guests data");
    }
    
    console.log(`Found ${guestsData?.length || 0} guests in database`);

    // Fetch all cabins with their names and IDs
    const { data: cabinsData, error: cabinsError } = await supabase
      .from("cabins")
      .select("id, name");
      
    if (cabinsError) {
      console.error("Error fetching cabins:", cabinsError);
      throw new Error("Could not fetch cabins data");
    }
    
    console.log(`Found ${cabinsData?.length || 0} cabins in database`);
    
    // If we don't have any guests or cabins, we can't create bookings
    if (!guestsData?.length || !cabinsData?.length) {
      console.error("No guests or cabins found in database");
      throw new Error("No guests or cabins found. Please upload them first.");
    }

    // Map mock guests to database guests by matching emails
    const guestMap = {};
    mockGuests.forEach((mockGuest, index) => {
      // Find the corresponding guest in the database
      const dbGuest = guestsData.find(g => g.email === mockGuest.email);
      if (dbGuest) {
        guestMap[index + 1] = dbGuest.id;
      }
    });
    
    console.log("Guest mapping:", guestMap);

    // Process bookings to ensure they have the correct guestId and cabinId
    const finalBookings = bookings.map((booking) => {
      // Get the guestId from our mapping or use a random guest if not found
      const guestId = guestMap[booking.guestId] || 
        guestsData[Math.floor(Math.random() * guestsData.length)].id;
      
      // Make sure we have a valid cabinId
      let cabinId = booking.cabinId;
      if (!cabinsData.some(c => c.id === cabinId)) {
        // If the cabinId doesn't exist, use a random one
        cabinId = cabinsData[Math.floor(Math.random() * cabinsData.length)].id;
      }
      
      // Calculate the cabin price (assume $100 per night as base price)
      const numNights = (new Date(booking.endDate) - new Date(booking.startDate)) / 
        (1000 * 60 * 60 * 24);
      const cabinPrice = numNights * 100;
      
      // Calculate extras price for breakfast
      const extrasPrice = booking.hasBreakfast ? numNights * 15 * booking.numGuests : 0;
      
      // Calculate total price
      const totalPrice = cabinPrice + extrasPrice;

      return {
        ...booking,
        guestId,
        cabinId,
        cabinPrice,
        extrasPrice,
        totalPrice,
        numNights,
      };
    });
    
    console.log(`Prepared ${finalBookings.length} bookings for insertion`);

    // Insert the bookings
    const { data, error } = await supabase.from("bookings").insert(finalBookings);
    
    if (error) {
      console.error("Error inserting bookings:", error);
      throw new Error(`Failed to create bookings: ${error.message}`);
    }
    
    console.log("Successfully created bookings!");
    return data;
  } catch (err) {
    console.error("Error in createBookings:", err);
    throw new Error(`Failed to create bookings: ${err.message}`);
  }
}
