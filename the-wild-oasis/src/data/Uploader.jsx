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
  try {
    console.log("Starting to create bookings...");
    
    // Fetch all guests with their IDs
    const { data: guestsData, error: guestsError } = await supabase
      .from("guests")
      .select("id, fullName, email");
      
    if (guestsError) {
      console.error("Error fetching guests:", guestsError);
      throw new Error("Could not fetch guests data");
    }
    
    console.log(`Found ${guestsData?.length || 0} guests in database`);
    
    // Fetch all cabins with their IDs
    const { data: cabinsData, error: cabinsError } = await supabase
      .from("cabins")
      .select("id, name, regularPrice");
      
    if (cabinsError) {
      console.error("Error fetching cabins:", cabinsError);
      throw new Error("Could not fetch cabins data");
    }
    
    console.log(`Found ${cabinsData?.length || 0} cabins in database`);
    
    if (!guestsData?.length || !cabinsData?.length) {
      throw new Error("No guests or cabins found. Please check your database.");
    }
    
    // Create a mapping from mock guest IDs to actual database IDs
    // Since we don't know which guest in the DB corresponds to which mock guest,
    // we'll assign them sequentially
    const guestIdMap = {};
    const availableGuests = [...guestsData];
    
    for (let i = 1; i <= guests.length; i++) {
      if (availableGuests.length > 0) {
        // Get a random guest from the available guests
        const randomIndex = Math.floor(Math.random() * availableGuests.length);
        const dbGuest = availableGuests.splice(randomIndex, 1)[0];
        guestIdMap[i] = dbGuest.id;
      }
    }
    
    console.log("Guest ID mapping:", guestIdMap);
    
    // Create a mapping from mock cabin IDs to actual database IDs
    const cabinIdMap = {};
    cabinsData.forEach(cabin => {
      // Assuming cabins are numbered from 1 to N in both mock data and DB
      const mockCabinId = cabinsData.findIndex(c => c.id === cabin.id) + 1;
      cabinIdMap[mockCabinId] = cabin.id;
    });
    
    console.log("Cabin ID mapping:", cabinIdMap);
    
    // Process the bookings
    const finalBookings = bookings.map(booking => {
      // Get the database IDs for guest and cabin
      const dbGuestId = guestIdMap[booking.guestId] || guestsData[0].id;
      const dbCabinId = cabinIdMap[booking.cabinId] || cabinsData[0].id;
      
      // Find the cabin to get its price
      const cabin = cabinsData.find(c => c.id === dbCabinId);
      const cabinPrice = cabin ? cabin.regularPrice * (booking.numNights || 1) : 100;
      
      // Calculate the number of nights
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const numNights = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Calculate extras price for breakfast
      const extrasPrice = booking.hasBreakfast ? numNights * 15 * booking.numGuests : 0;
      
      // Calculate total price
      const totalPrice = cabinPrice + extrasPrice;
      
      // Determine status based on dates
      let status;
      if (isPast(new Date(booking.endDate)) && !isToday(new Date(booking.endDate))) {
        status = "checked-out";
      } else if (isFuture(new Date(booking.startDate)) || isToday(new Date(booking.startDate))) {
        status = "unconfirmed";
      } else {
        status = "checked-in";
      }
      
      return {
        ...booking,
        guestId: dbGuestId,
        cabinId: dbCabinId,
        numNights: numNights || 1,
        cabinPrice,
        extrasPrice,
        totalPrice,
        status,
        isPaid: booking.isPaid ?? true
      };
    });
    
    console.log("Prepared bookings for insertion:", finalBookings);
    
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
