import styled from "styled-components";
import Spinner from "../../ui/Spinner";
import useRecentBookings from "./useRecentBookings";
import useRecentStays from "./useRecentStays";
import Stats from "./stats";
import useCabin from "./../cabins/useCabin";
const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

export default function DashboardLayout() {
  const { stays, confirmedStays, isLoading2 } = useRecentStays();
  const { isLoading1, bookings, numDays } = useRecentBookings();
  const { isLoading3, cabins } = useCabin();
  if (isLoading1 || isLoading2 || isLoading3) return <Spinner />;
  console.log(bookings);

  return (
    <StyledDashboardLayout>
      <Stats
        bookings={bookings}
        confirmedStays={confirmedStays}
        numDays={numDays}
        cabinCount={cabins?.length}
      />
      <div>Todays Activities</div>
      <div>Chart stay duration</div>
      <div>Chart of sales</div>
    </StyledDashboardLayout>
  );
}
