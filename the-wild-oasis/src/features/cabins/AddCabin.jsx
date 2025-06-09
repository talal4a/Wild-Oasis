import Button from "../../ui/Button";
import CreateCabinForm from "./CreateCabinForm";
import Modal from "../../ui/Modal";
import CabinTable from "./CabinTable";
import styled from "styled-components";
const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 10px;
`;
export default function ADDCabin() {
  return (
    <Modal>
      <ButtonStack>
        <Modal.Open opens="cabin-form">
          <Button fullWidth>Add new Cabin</Button>
        </Modal.Open>
      </ButtonStack>
      <Modal.Window name="cabin-form">
        <CreateCabinForm />
      </Modal.Window>
      <ButtonStack>
        <Modal.Open opens="table">
          <Button fullWidth>Show table</Button>
        </Modal.Open>
      </ButtonStack>
      <Modal.Window name="table">
        <CabinTable />
      </Modal.Window>
    </Modal>
  );
}
// export default function AddCabin() {
//   const [isOpenModal, setIsOpenModal] = useState(false);
//   const handleCloseModal = () => setIsOpenModal(false);
//   return (
//     <div>
//       <Button onClick={() => setIsOpenModal((show) => !show)}>
//         Add new Cabin
//       </Button>
//       {isOpenModal && (
//         <Modal isClose={handleCloseModal}>
//           <CreateCabinForm isCloseModel={handleCloseModal} />
//         </Modal>
//       )}
//     </div>
//   );
// }
