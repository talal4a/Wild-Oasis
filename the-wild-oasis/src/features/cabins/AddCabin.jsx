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
    <div>
      <Modal>
        <ButtonStack>
          <Modal.Open opens="cabin-form">
            <Button fullwidth="true">Add new Cabin</Button>
          </Modal.Open>
        </ButtonStack>
        <Modal.Window name="cabin-form">
          <CreateCabinForm />
        </Modal.Window>
      </Modal>
    </div>
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
