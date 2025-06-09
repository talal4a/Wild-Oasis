import { useState } from "react";
import Button from "../../ui/Button";
import CreateCabinForm from "./CreateCabinForm";
import Modal from "../../ui/Modal";


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
