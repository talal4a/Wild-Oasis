import { getToday } from "../utils/helpers";
import supabase from "./supaBase";
import { bookings } from "../data/data-bookings";
import { guests as mockGuests } from "../data/data-guests";
export async function getBookings({ filter, sortBy } = {}) {
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
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Bookings could not be loaded");
  }
  
  // If we have data but the guest information is missing, add it from mock data
  if (data && data.length > 0) {
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
  // Fetch all guests with their emails and IDs
  const { data: guestsData } = await supabase
    .from("guests")
    .select("id, email");

  // Fetch all cabins with their names and IDs (if needed)
  const { data: cabinsData } = await supabase.from("cabins").select("id, name");

  const finalBookings = bookings.map((booking) => {
    // Find the guest by email (assuming your mock data has guestEmail)
    const guest = guestsData.find((g) => g.email === booking.guestEmail);
    // Find the cabin by name or other unique field if needed
    // const cabin = cabinsData.find(c => c.name === booking.cabinName);

    // ...calculate numNights, prices, status as before...

    return {
      ...booking,
      guestId: guest ? guest.id : null,
      // cabinId: cabin ? cabin.id : null,
      // ...other fields...
    };
  });

  // Filter out bookings with missing guestId (optional, for safety)
  const validBookings = finalBookings.filter((b) => b.guestId);

  const { error } = await supabase.from("bookings").insert(validBookings);
  if (error) {
    throw new Error(`Failed to create bookings: ${error.message}`);
  }
}
