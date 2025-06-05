import styled from "styled-components";
const Row = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.type === "horizontal" ? "row" : "")};
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
`;
export default Row;
