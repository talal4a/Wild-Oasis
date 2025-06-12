import Spinner from "./../../ui/Spinner";
import CabinRow from "./CabinRow";
import useCabin from "./useCabin";
import Table from "./../../ui/Table";
import Menus from "../../ui/Menus";
import { useSearchParams } from "react-router-dom";
import Empty from "./../../ui/Empty";

export default function CabinTable() {
  const { isLoading, cabin } = useCabin();
  const [searchParams] = useSearchParams();
  
  if (isLoading) {
    return <Spinner />;
  }
  
  if (!cabin || !cabin.length) {
    return <Empty resourceName="Cabin" />;
  }
  
  // Process cabin data to ensure all required fields are present
  const processedCabins = cabin.map(cabinItem => {
    return {
      id: cabinItem.id,
      name: cabinItem.name || "Unnamed Cabin",
      maxCapacity: cabinItem.maxCapacity || 1,
      regularPrice: cabinItem.regularPrice || 0,
      discount: cabinItem.discount || 0,
      image: cabinItem.image || "",
      description: cabinItem.description || ""
    };
  });
  
  //Filter
  const filterValue = searchParams.get("discount") || "all";
  let filterCabins;
  if (filterValue === "all") filterCabins = processedCabins;
  if (filterValue === "no-discount")
    filterCabins = processedCabins.filter((cabin) => cabin.discount === 0);
  if (filterValue === "with-discount")
    filterCabins = processedCabins.filter((cabin) => cabin.discount > 0);
    
  //SortBY
  const sortBy = searchParams.get("sortBy") || "startDate-asc";
  const [field, direction] = sortBy.split("-");
  const modifier = direction === "asc" ? 1 : -1;
  const sortedCabins = [...filterCabins].sort((a, b) => {
    const aValue = a[field] || 0;
    const bValue = b[field] || 0;
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
