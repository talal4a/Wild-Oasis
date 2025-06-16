import styled from "styled-components";
import Spinner from "../../ui/Spinner";
import useRecentBookings from "./useRecentBookings";
import useRecentStays from "./useRecentStays";
import Stats from "./stats";
import useCabin from "./../cabins/useCabin";
import SalesChart from "./SalesChart";
import DurationChart from "./DurationChart";
import TodayActivity from "../check-in-out/TodayActivity";
const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto 34rem 34rem;
  gap: 2.4rem;
`;
export default function DashboardLayout() {
  const { stays, confirmedStays, isLoading2 } = useRecentStays();
  const { isLoading1, bookings, numDays } = useRecentBookings();
  const { isLoading3, cabins } = useCabin();
  if (isLoading1 || isLoading2 || isLoading3) return <Spinner />;
  return (
    <StyledDashboardLayout>
      <Stats
        bookings={bookings}
        confirmedStays={confirmedStays}
        numDays={numDays}
        cabinCount={cabins?.length}
      />
      <TodayActivity />
      <DurationChart confirmedStays={confirmedStays} />
      <SalesChart bookings={bookings || []} numDays={numDays} />
    </StyledDashboardLayout>
  );
}
