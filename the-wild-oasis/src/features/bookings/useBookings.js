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
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  const { isLoading, data, error } = useQuery({
    queryKey: ["bookings", filter, sortBy, page],
    queryFn: () => getBookings({ filter, sortBy, page }),
  });

  const bookings = data?.data ?? [];
  const count = data?.count ?? 0;

  return { isLoading, bookings, error, count };
}
