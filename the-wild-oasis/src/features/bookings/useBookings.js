import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings } from "../../services/apiBookings";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
export default function useBookings() {
  const queryClient = useQueryClient();
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
  //Pre-Fetching
  const count = data?.count ?? 0;
  const pageCount = Math.ceil(count / PAGE_SIZE);
  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["bookings", filter, sortBy, page + 1],
      queryFn: () => getBookings({ filter, sortBy, page: page + 1 }),
    });
  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["bookings", filter, sortBy, page - 1],
      queryFn: () => getBookings({ filter, sortBy, page: page - 1 }),
    });
  const bookings = data?.data ?? [];

  return { isLoading, bookings, error, count };
}
