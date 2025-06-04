import styled from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";
const H1 = styled.div`
  font-weight: bold;
  font-size: x-large;
`;
export default function App() {
  return (
    <>
      <GlobalStyle />
      <H1>Hello World</H1>
    </>
  );
}
