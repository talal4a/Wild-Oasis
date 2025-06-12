import BookingRow from "./BookingRow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "./../../ui/Empty";
import useBookings from "./useBookings";
import Spinner from "./../../ui/Spinner";
import { guests as mockGuests } from "../../data/data-guests";
import supabase from "../../services/supaBase";

function BookingTable() {
  const { bookings, isLoading } = useBookings();
  
  if (isLoading) return <Spinner />;
  if (!bookings?.length) return <Empty resourceName="Booking" />;

  // Process bookings to ensure guest data is in the correct format
  const processedBookings = bookings.map(booking => {
    // Try to find the guest by ID from the mock data
    // This is a fallback if the API join doesn't work
    const mockGuest = booking.guestId 
      ? mockGuests.find((_, index) => index + 1 === booking.guestId) 
      : null;
    
    // Handle different possible structures of guest data
    let guestData = booking.guests;
    
    // If guests is an array, extract the first item
    if (Array.isArray(guestData) && guestData.length > 0) {
      guestData = {
        fullName: guestData[0].fullName,
        email: guestData[0].email
      };
    } 
    // If guests is null/undefined or empty, use mock data
    else if (!guestData || !guestData.fullName) {
      guestData = mockGuest || {
        fullName: "Unknown Guest",
        email: "-"
      };
    }
    
    // Same for cabin data
    let cabinData = booking.cabins;
    if (Array.isArray(cabinData) && cabinData.length > 0) {
      cabinData = { name: cabinData[0].name };
    } else if (!cabinData) {
      cabinData = { name: `Cabin ${booking.cabinId || "Unknown"}` };
    }
    
    return {
      ...booking,
      guests: guestData,
      cabins: cabinData
    };
  });

  return (
    <Menus>
      <Table columns="0.6fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
        <Table.Header>
          <div>Cabin</div>
          <div>Guest</div>
          <div>Dates</div>
          <div>Status</div>
          <div>Amount</div>
          <div></div>
        </Table.Header>
        <Table.Body
          data={processedBookings}
          render={(booking) => (
            <BookingRow key={booking.id} booking={booking} />
          )}
        />
      </Table>
    </Menus>
  );
}
export default BookingTable;
