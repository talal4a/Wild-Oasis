import { useState } from "react";
import { isFuture, isPast, isToday } from "date-fns";
import Button from "../ui/Button";
import { subtractDates } from "../utils/helpers";
import { bookings } from "./data-bookings";
import { cabins } from "./data-cabins";
import { guests } from "./data-guests";
import supabase from "../services/supaBase";

// const originalSettings = {
//   minBookingLength: 3,
//   maxBookingLength: 30,
//   maxGuestsPerBooking: 10,
//   breakfastPrice: 15,
// };

async function deleteGuests() {
  const { error } = await supabase.from("guests").delete().gt("id", 0);
  if (error) throw new Error(error.message);
}

async function deleteCabins() {
  const { error } = await supabase.from("cabins").delete().gt("id", 0);
  if (error) throw new Error(error.message);
}

async function deleteBookings() {
  const { error } = await supabase.from("bookings").delete().gt("id", 0);
  if (error) throw new Error(error.message);
}

async function createGuests() {
  const { error } = await supabase.from("guests").insert(guests);
  if (error) throw new Error(error.message);
}

async function createCabins() {
  const { error } = await supabase.from("cabins").insert(cabins);
  if (error) throw new Error(error.message);
}

async function createBookings() {
  // Bookings need a guestId and a cabinId. We can't tell Supabase IDs for each object, it will calculate them automatically (we could, but that's not common). So it might be different for different people, especially after multiple uploads. Therefore, we need to first get all guestIds and cabinIds, and then replace the original IDs in the booking data with the actual ones from the DB
  const { data: guestsIds } = await supabase
    .from("guests")
    .select("id, fullName");
  const { data: cabinsIds } = await supabase
    .from("cabins")
    .select("id, name");

  const finalBookings = bookings.map((booking) => {
    // Get the correct guestId
    const guestId = guestsIds.find(
      (guest) => guest.fullName === booking.guestName
    )?.id;

    // Get the correct cabinId
    const cabinId = cabinsIds.find(
      (cabin) => cabin.name === booking.cabinName
    )?.id;

    // Calculate the number of nights from the arrival and departure date
    const numNights = subtractDates(booking.endDate, booking.startDate);

    // Calculate the cabin price
    const cabinPrice = booking.cabinPrice;

    // Calculate the extra price (for breakfast)
    const extrasPrice = booking.hasBreakfast
      ? numNights * 15 * booking.numGuests
      : 0; // hardcoded breakfast price

    // Calculate the total price
    const totalPrice = cabinPrice + extrasPrice;

    // Define the status
    let status;
    if (
      isPast(new Date(booking.endDate)) &&
      !isToday(new Date(booking.endDate))
    )
      status = "checked-out";
    if (
      isFuture(new Date(booking.startDate)) ||
      isToday(new Date(booking.startDate))
    )
      status = "unconfirmed";
    if (
      (isFuture(new Date(booking.endDate)) ||
        isToday(new Date(booking.endDate))) &&
      isPast(new Date(booking.startDate)) &&
      !isToday(new Date(booking.startDate))
    )
      status = "checked-in";

    return {
      ...booking,
      guestId,
      cabinId,
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice,
      status,
      isPaid: booking.isPaid ?? true,
    };
  });

  const { error } = await supabase.from("bookings").insert(finalBookings);
  if (error) throw new Error(error.message);
}

function Uploader() {
  const [isLoading, setIsLoading] = useState(false);

  async function uploadAll() {
    setIsLoading(true);
    // Bookings need to be deleted FIRST
    await deleteBookings();
    await deleteGuests();
    await deleteCabins();

    // Guests and cabins need to be created BEFORE bookings
    await createGuests();
    await createCabins();
    await createBookings();

    setIsLoading(false);
  }

  async function uploadBookings() {
    setIsLoading(true);
    await deleteBookings();
    await createBookings();
    setIsLoading(false);
  }

  return (
    <div
      style={{
        marginTop: "auto",
        backgroundColor: "#e0e7ff",
        padding: "8px",
        borderRadius: "5px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <h3>SAMPLE DATA</h3>

      <Button onClick={uploadAll} disabled={isLoading}>
        Upload ALL sample data
      </Button>

      <Button onClick={uploadBookings} disabled={isLoading}>
        Upload bookings ONLY
      </Button>
    </div>
  );
}

export default Uploader;
