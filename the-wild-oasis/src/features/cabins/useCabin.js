import { useQuery } from "@tanstack/react-query";
import { getCabins } from "../../services/apiCabins";
export default function useCabin() {
  const {
    isLoading,
    data: cabin,
    error,
  } = useQuery({
    queryKey: ["cabin"],
    queryFn: async () => {
      console.log("Fetching cabins...");
      try {
        const data = await getCabins();
        console.log("Cabins data:", data);
        return data;
      } catch (err) {
        console.error("Error fetching cabins:", err);
        throw err;
      }
    },
  });
  
  console.log("useCabin hook state:", { isLoading, cabin, error });
  return { isLoading, cabin, error };
}
