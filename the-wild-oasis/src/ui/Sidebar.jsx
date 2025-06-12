import styled from "styled-components";
import Logo from "./Logo.jsx";
import MainNav from "./MainNav.jsx";
import Uploader from "../data/Uploader.jsx";
import CheckSchema from "../data/CheckSchema.jsx";

const SideBar = styled.aside`
  background-color: var(--color-grey-0);
  padding: 3.2rem 2.4rem;
  border-right: 1px solid var(--color-grey-100);
  grid-row: 1/-1;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

export default function Sidebar() {
  return (
    <SideBar>
      <Logo />
      <MainNav />
      <Uploader />
      <CheckSchema />
    </SideBar>
  );
}
