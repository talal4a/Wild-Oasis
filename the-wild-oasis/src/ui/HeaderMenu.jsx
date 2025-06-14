import styled from "styled-components";
import ButtonIcon from "./ButtonIcon";
import { HiOutlineUser } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import LogOut from "../features/authentication/LogOut";
const StyledHeaderMenu = styled.ul`
  display: flex;
  gap: 0.4rem;
`;
export default function HeaderMenu() {
  const navigate = useNavigate();
  return (
    <StyledHeaderMenu>
      <li>
        <ButtonIcon onClick={() => navigate("/account")}>
          <HiOutlineUser />
        </ButtonIcon>
        <LogOut />
      </li>
    </StyledHeaderMenu>
  );
}
