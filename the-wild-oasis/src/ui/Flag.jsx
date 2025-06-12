import styled from "styled-components";

const StyledFlag = styled.img`
  max-width: 2rem;
  border-radius: var(--border-radius-tiny);
  display: block;
  border: 1px solid var(--color-grey-100);
`;

function Flag({ src, alt }) {
  return <StyledFlag src={src} alt={alt} />;
}

export default Flag;
