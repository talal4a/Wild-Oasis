import styled, { css } from "styled-components";
// Size variants
const sizes = {
  small: css`
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
  `,
  medium: css`
    font-size: 1.3rem;
    padding: 1.2rem 1.6rem;
    font-weight: 500;
  `,
  large: css`
    font-size: 1.5rem;
    padding: 1.2rem 2.4rem;
    font-weight: 500;
  `,
};
// Color variants
const variations = {
  primary: css`
    color: var(--color-brand-50);
    background-color: var(--color-brand-600);

    &:hover {
      background-color: var(--color-brand-700);
    }
  `,
  secondary: css`
    color: var(--color-grey-600);
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);

    &:hover {
      background-color: var(--color-grey-50);
    }
  `,
  danger: css`
    color: var(--color-red-100);
    background-color: var(--color-red-700);

    &:hover {
      background-color: var(--color-red-800);
    }
  `,
};
// Final styled button

const Button = styled.button`
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  height: ${(props) => (props.$size === "small" ? "auto" : "5rem")};
  ${(props) => sizes[props.$size || "medium"]};
  ${(props) => variations[props.$variation || "primary"]};
  ${(props) =>
    props.fullwidth &&
    css`
      width: 100%;
      display: block;
    `}
`;

export default Button;
