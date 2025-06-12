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
  try {
    console.log("Checking guests table schema...");
    // Get the schema information for the guests table
    const { data: schema, error: schemaError } = await supabase
      .from('guests')
      .select('*')
      .limit(0);
      
    if (schemaError) {
      console.error("Error fetching schema:", schemaError);
      throw new Error(schemaError.message);
    }
    
    // Log the available columns
    console.log("Available columns in guests table:", Object.keys(schema?.length > 0 ? schema[0] : {}));
    
    // Create a modified version of guests data without the nationalID field
    const modifiedGuests = guests.map(({ nationalID, ...rest }) => {
      // If nationalID is needed, we could rename it to a field that exists in the DB
      // For example, if there's an "identificationNumber" field instead:
      // return { ...rest, identificationNumber: nationalID };
      
      // Or just return without the nationalID field
      return rest;
    });
    
    console.log("Inserting guests data without nationalID field");
    const { error } = await supabase.from("guests").insert(modifiedGuests);
    if (error) throw new Error(error.message);
    
    console.log("Successfully inserted guests data");
  } catch (err) {
    console.error("Error in createGuests:", err);
    throw err;
  }
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
  const [error, setError] = useState(null);

  async function uploadAll() {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting data upload process...");
      
      // Bookings need to be deleted FIRST
      console.log("Deleting existing bookings...");
      await deleteBookings();
      
      console.log("Deleting existing guests...");
      await deleteGuests();
      
      console.log("Deleting existing cabins...");
      await deleteCabins();

      // Guests and cabins need to be created BEFORE bookings
      console.log("Creating guests...");
      await createGuests();
      
      console.log("Creating cabins...");
      await createCabins();
      
      console.log("Creating bookings...");
      await createBookings();
      
      console.log("All data uploaded successfully!");
    } catch (err) {
      console.error("Error during data upload:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function uploadBookings() {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteBookings();
      await createBookings();
    } catch (err) {
      console.error("Error uploading bookings:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
      
      {error && (
        <p style={{ color: "red", fontSize: "1.4rem", margin: "0.5rem 0" }}>
          Error: {error}
        </p>
      )}
      
      {isLoading && (
        <p style={{ color: "blue", fontSize: "1.4rem", margin: "0.5rem 0" }}>
          Loading... Please wait
        </p>
      )}
    </div>
  );
}

export default Uploader;
