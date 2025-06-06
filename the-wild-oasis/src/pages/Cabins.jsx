import { useEffect, useState } from "react";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import { getCabins } from "../services/apiCabins";
import CabinTable from "../features/cabins/CabinTable";
import Button from "../ui/Button";
import CreateCabinForm from "../features/cabins/CreateCabinForm";
function Cabins() {
  const [showForm, setshowForm] = useState(false);
  useEffect(function () {
    getCabins().then((data) => console.log(data));
  }, []);
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All cabins</Heading>
        <p>Filter / Sort</p>
      </Row>
      <Row>
        <CabinTable />

        <Button onClick={() => setshowForm((show) => !show)}>
          Add new Cabin
        </Button>

        {showForm && <CreateCabinForm />}
      </Row>
    </>
  );
}
export default Cabins;
