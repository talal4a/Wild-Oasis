import Stat from "./Stat";
import {
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
} from "react-icons/hi2";

export default function Stats({ bookings = [], confirmedStays = [] }) {
  // Total number of bookings
  const numBookings = bookings.length;

  // Total number of confirmed stays
  const numConfirmedStays = confirmedStays.length;

  // Calculate total sales from confirmed stays
  const totalSales = confirmedStays.reduce(
    (sum, stay) => sum + stay.totalPrice,
    0
  );

  // Calculate occupancy rate (% of confirmed bookings out of total bookings)
  const occupancyRate =
    bookings.length > 0
      ? Math.round((confirmedStays.length / bookings.length) * 100)
      : 0;

  return (
    <>
      <Stat
        title="Bookings"
        color="blue"
        icon={<HiOutlineBriefcase />}
        value={numBookings}
      />
      <Stat
        title="Stays"
        color="green"
        icon={<HiOutlineCalendarDays />}
        value={numConfirmedStays}
      />
      <Stat
        title="Sales"
        color="indigo"
        icon={<HiOutlineCurrencyDollar />}
        value={`$${totalSales}`}
      />
      <Stat
        title="Occupancy Rate"
        color="yellow"
        icon={<HiOutlineChartBar />}
        value={`${occupancyRate}%`}
      />
    </>
  );
}
