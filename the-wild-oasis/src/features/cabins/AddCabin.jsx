import Button from "../../ui/Button";
import CreateCabinForm from "./CreateCabinForm";
import Modal from "../../ui/Modal";
export default function ADDCabin() {
  return (
    <Modal>
      <Modal.Open opens="cabin-form">
        <Button>Add new Cabin</Button>
      </Modal.Open>
      <Modal.Window name="cabin-form">
        <CreateCabinForm />
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
