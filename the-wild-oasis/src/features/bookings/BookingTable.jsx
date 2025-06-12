import BookingRow from "./BookingRow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "./../../ui/Empty";
import useBookings from "./useBookings";
import Spinner from "./../../ui/Spinner";
import { guests as mockGuests } from "../../data/data-guests";
import Pagination from "../../ui/Pagination";

function BookingTable() {
  const { bookings, isLoading } = useBookings();
  
  if (isLoading) return <Spinner />;
  if (!bookings?.length) return <Empty resourceName="Booking" />;

  // Process bookings to ensure guest data is in the correct format
  const processedBookings = bookings.map(booking => {
    // Handle guest data
    let guestData = booking.guests;
    
    // If guests is an array, extract the first item
    if (Array.isArray(guestData) && guestData.length > 0) {
      guestData = guestData[0];
    } 
    // If guests is null/undefined or empty object
    else if (!guestData || Object.keys(guestData || {}).length === 0) {
      // Try to find the guest by ID from the mock data
      const mockGuest = booking.guestId && booking.guestId <= mockGuests.length
        ? mockGuests[booking.guestId - 1]
        : null;
        
      guestData = mockGuest || {
        fullName: "Unknown Guest",
        email: "guest@example.com"
      };
    }
    
    // Handle cabin data
    let cabinData = booking.cabins;
    
    // If cabins is an array, extract the first item
    if (Array.isArray(cabinData) && cabinData.length > 0) {
      cabinData = cabinData[0];
    }
    // If cabins is null/undefined or empty object
    else if (!cabinData || Object.keys(cabinData || {}).length === 0) {
      cabinData = { 
        name: `Cabin ${booking.cabinId || "Unknown"}`,
        maxCapacity: booking.numGuests || 1
      };
    }
    
    // Ensure we have totalPrice (default to 0 if missing)
    const totalPrice = booking.totalPrice || 0;
    
    // Create a processed booking object with all required fields
    return {
      ...booking,
      guests: guestData,
      cabins: cabinData,
      totalPrice
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
        <Table.Footer>
          <Pagination count={15}/>
        </Table.Footer>
      </Table>
    </Menus>
  );
}
export default BookingTable;
