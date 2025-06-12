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

    // First, get count of total bookings to avoid Range error
    const { count: totalCount, error: countError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error("Could not retrieve bookings count");
    }

    // Apply pagination safely
    if (page) {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Don't fetch if out of range
      if (from >= totalCount) {
        return { data: [], count: totalCount };
      }

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

    return { data: enhancedData, count: totalCount };
  } catch (err) {
    throw new Error(`Failed to fetch bookings: ${err.message}`);
  }
}
