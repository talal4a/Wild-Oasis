import { useSearchParams } from "react-router-dom";
import { subDays } from "data-fns";
import { useQuery } from "@tanstack/react-query";
import { getBookingAfterDate } from "../../services/apiBookings";
export default function useRecentBookings() {
  const [searchParams] = useSearchParams();
  const numDays = !searchParams.get("last")
    ? 7
    : Number(searchParams.get("last"));
  const queryDate = subDays(new Date(), numDays).toISOstring();
  const { isLoading, data: bookings } = useQuery({
    queryFn: () => getBookingAfterDate(queryDate),
    queryKey: ["bookings", `last-${numDays}`],
  });
  return { isLoading, bookings };
}
