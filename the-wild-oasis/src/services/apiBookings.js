import { getToday } from "../utils/helpers";
import supabase from "./supaBase";
import { bookings } from "../data/data-bookings";
import { guests as mockGuests } from "../data/data-guests";
import { PAGE_SIZE } from "../utils/constants";
export async function getBookings({ filter, sortBy, page } = {}) {
  try {
    const { data: allGuests, error: guestsError } = await supabase
      .from("guests")
      .select("id, fullName, email");

    if (guestsError) {
      throw new Error("Guests could not be loaded");
    }

    let query = supabase
      .from("bookings")
      .select("*, cabins(*), guests(*)", { count: "exact" });

    if (filter) {
      query = query.eq(filter.field, filter.value);
    }

    if (sortBy) {
      const { field, direction } = sortBy;
      const ascending = (direction || "desc") === "asc";
      query = query.order(field, { ascending });
    }
    if (page) {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);
    }
    const { data, error, count } = await query;

    if (error) {
      throw new Error("Bookings could not be loaded");
    }

    const enhancedData = (data || []).map((booking) => {
      // Process guests data
      let guestData = booking.guests;

      if (Array.isArray(guestData) && guestData.length > 0) {
        guestData = guestData[0];
      } else if (
        (!guestData || Object.keys(guestData || {}).length === 0) &&
        booking.guestId
      ) {
        const foundGuest = allGuests?.find((g) => g.id === booking.guestId);
        if (foundGuest) {
          guestData = foundGuest;
        } else {
          const mockGuest =
            booking.guestId && booking.guestId <= mockGuests.length
              ? mockGuests[booking.guestId - 1]
              : null;

          guestData = mockGuest || {
            fullName: "Unknown Guest",
            email: `guest-${booking.id}@example.com`,
          };
        }
      }

      // Process cabins data
      let cabinData = booking.cabins;

      if (Array.isArray(cabinData) && cabinData.length > 0) {
        cabinData = cabinData[0];
      } else if (!cabinData || Object.keys(cabinData || {}).length === 0) {
        cabinData = {
          name: `Cabin ${booking.cabinId || "Unknown"}`,
          maxCapacity: booking.numGuests || 1,
        };
      }

      const totalPrice = booking.totalPrice || 0;

      return {
        ...booking,
        guests: guestData,
        cabins: cabinData,
        totalPrice,
      };
    });

    return { data: enhancedData, count };
  } catch (err) {
    throw new Error(`Failed to fetch bookings: ${err.message}`);
  }
}

export async function getBooking(id) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, cabins(*), guests(*)")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error("Booking not found");
    }

    return data;
  } catch (err) {
    throw new Error(`Failed to fetch booking: ${err.message}`);
  }
}
export async function getBookingsAfterDate(date) {
  console.log("Fetching bookings after date:", date);
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Bookings could not get loaded");
  }

  console.log("Raw bookings data:", data);

  // Process the data to ensure we have the correct prices
  const processedData = data.map(booking => {
    // Calculate number of nights
    const numNights = Math.ceil(
      (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate cabin price (base price per night)
    const cabinPrice = numNights * 100; // Assuming $100 per night as base price
    
    // Calculate extras price (breakfast)
    const extrasPrice = booking.hasBreakfast ? (numNights * 15 * booking.numGuests) : 0; // $15 per guest per night
    
    // Calculate total price
    const totalPrice = cabinPrice + extrasPrice;
    
    return {
      ...booking,
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice
    };
  });

  console.log("Processed bookings data:", processedData);

  return processedData;
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
      const dbGuest = guestsData.find((g) => g.email === mockGuest.email);
      if (dbGuest) {
        guestMap[index + 1] = dbGuest.id;
      }
    });

    console.log("Guest mapping:", guestMap);

    // Process bookings to ensure they have the correct guestId and cabinId
    const finalBookings = bookings.map((booking) => {
      // Get the guestId from our mapping or use a random guest if not found
      const guestId =
        guestMap[booking.guestId] ||
        guestsData[Math.floor(Math.random() * guestsData.length)].id;

      // Make sure we have a valid cabinId
      let cabinId = booking.cabinId;
      if (!cabinsData.some((c) => c.id === cabinId)) {
        // If the cabinId doesn't exist, use a random one
        cabinId = cabinsData[Math.floor(Math.random() * cabinsData.length)].id;
      }

      // Calculate the cabin price (assume $100 per night as base price)
      const numNights =
        (new Date(booking.endDate) - new Date(booking.startDate)) /
        (1000 * 60 * 60 * 24);
      const cabinPrice = numNights * 100;

      // Calculate extras price for breakfast
      const extrasPrice = booking.hasBreakfast
        ? numNights * 15 * booking.numGuests
        : 0;

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
    const { data, error } = await supabase
      .from("bookings")
      .insert(finalBookings);

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
