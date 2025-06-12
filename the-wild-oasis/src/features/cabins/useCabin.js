import { useQuery } from "@tanstack/react-query";
import { getCabins } from "../../services/apiCabins";
export default function useCabin() {
  const {
    isLoading,
    data: cabin,
    error,
  } = useQuery({
    queryKey: ["cabin"],
    queryFn: getCabins,
  });
  return { isLoading, cabin, error };
}
