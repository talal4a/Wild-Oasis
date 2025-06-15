import Stat from "./Stat";
import {
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
} from "react-icons/hi2";

export default function Stats({
  bookings = [],
  confirmedStays = [],
  numDays = 7,
  cabinCount = 1,
}) {
  const numBookings = bookings.length;
  const numConfirmedStays = confirmedStays.length;

  const totalSales = confirmedStays.reduce(
    (sum, stay) => sum + stay.totalPrice,
    0
  );

  const totalNights = confirmedStays.reduce(
    (acc, cur) => acc + cur.numNights,
    0
  );

  const occupancyRate =
    confirmedStays.reduce((acc, cur) => acc + cur.numNights, 0) /
    (numDays * cabinCount);

  const formattedSales = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalSales);

  return (
    <>
      <Stat
        title="Bookings"
        color="blue"
        icon={<HiOutlineBriefcase />}
        value={numBookings}
      />
      <Stat
        title="Check-in"
        color="green"
        icon={<HiOutlineCalendarDays />}
        value={numConfirmedStays}
      />
      <Stat
        title="Sales"
        color="indigo"
        icon={<HiOutlineCurrencyDollar />}
        value={formattedSales}
      />
      <Stat
        title="Occupancy Rate"
        color="yellow"
        icon={<HiOutlineChartBar />}
        value={`${Math.round(occupancyRate)}%`}
      />
    </>
  );
}
