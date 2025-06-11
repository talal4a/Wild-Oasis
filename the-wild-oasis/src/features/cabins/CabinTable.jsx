import Spinner from "./../../ui/Spinner";
import CabinRow from "./CabinRow";
import useCabin from "./useCabin";
import Table from "./../../ui/Table";
import Menus from "../../ui/Menus";
import { useSearchParams } from "react-router-dom";
export default function CabinTable() {
  const { isLoading, cabin } = useCabin();
  const [searchParams] = useSearchParams();
  if (isLoading) {
    return <Spinner />;
  }
  //Filter
  const filterValue = searchParams.get("discount") || "all";
  let filterCabins;
  if (filterValue === "all") filterCabins = cabin;
  if (filterValue === "no-discount")
    filterCabins = cabin.filter((cabin) => cabin.discount === 0);
  if (filterValue === "with-discount")
    filterCabins = cabin.filter((cabin) => cabin.discount > 0);
  //SortBY
  const sortBy = searchParams.get("sortBy") || "startDate-asc";
  const [field, direction] = sortBy.split("-");
  const modifier = direction === "asc" ? 1 : -1;
  const sortedCabins = [...filterCabins].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    if (typeof aValue === "string") {
      return aValue.localeCompare(bValue) * modifier;
    }
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * modifier;
    }
    return (aValue - bValue) * modifier;
  });

  return (
    <Menus>
      <Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div></div>
          <div>Cabin</div>
          <div>Capacity</div>
          <div>Price</div>
          <div>Discount</div>
          <div></div>
        </Table.Header>
        <Table.Body
          data={sortedCabins}
          render={(cabin) => <CabinRow cabin={cabin} key={cabin.id} />}
        />
      </Table>
    </Menus>
  );
}
