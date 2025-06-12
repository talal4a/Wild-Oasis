import { useQuery } from "@tanstack/react-query";
import { getBookings } from "../../services/apiBookings";
import { useSearchParams } from "react-router-dom";

export default function useBookings() {
  const [searchParams] = useSearchParams();
  
  // Handle filter
  const filterValue = searchParams.get("status");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "status", value: filterValue };
  
  // Handle sorting
  const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };
  
  console.log("useBookings params:", { filter, sortBy });
  
  const {
    isLoading,
    data: bookings,
    error,
  } = useQuery({
    queryKey: ["bookings", filter, sortBy],
    queryFn: async () => {
      console.log("Fetching bookings...");
      try {
        const data = await getBookings({ filter, sortBy });
        console.log("Bookings data:", data);
        return data;
      } catch (err) {
        console.error("Error fetching bookings:", err);
        throw err;
      }
    },
  });
  
  console.log("useBookings hook state:", { isLoading, bookings, error });
  return { isLoading, bookings: bookings || [], error };
}
