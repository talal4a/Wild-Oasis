import { createContext, useContext, useState, cloneElement } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled from "styled-components";
// Styled Components
const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  transition: all 0.5s;
  z-index: 1001;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--backdrop-color);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.5s;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  position: absolute;
  top: 1.2rem;
  right: 1.9rem;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
  }
`;

// Modal Context
const ModalContext = createContext();

// Compound Modal Wrapper
function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const open = (name) => setOpenName(name);
  const close = () => setOpenName("");

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

// Open Component
function Open({ children, opens: windowName }) {
  const { open } = useContext(ModalContext);
  return cloneElement(children, {
    onClick: () => open(windowName),
  });
}

// Window Component
function Window({ children, name }) {
  const { openName, close } = useContext(ModalContext);

  if (name !== openName) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <StyledModal>
        <CloseButton onClick={close}>
          <HiXMark />
        </CloseButton>
        <div>
          {cloneElement(children, {
            onCloseModel: close,
          })}
        </div>
      </StyledModal>
    </Overlay>,
    document.body
  );
}
// Export all parts
Modal.Open = Open;
Modal.Window = Window;
export default Modal;
