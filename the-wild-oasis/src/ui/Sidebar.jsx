import styled from "styled-components";
const SideBar = styled.aside`
  background-color: blue;
  padding: 3, 2rem 2.4rem;
  border-right: 1px solid var(--color-grey-100);
`;
export default function Sidebar() {
  return <SideBar>Side Bar</SideBar>;
}
