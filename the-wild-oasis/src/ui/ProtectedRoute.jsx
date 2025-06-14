import styled from "styled-components";
import useUser from "../features/authentication/useUser";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const Fullpage = styled.div`
  height: 100vh;
  background-color: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
`;
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  if (isLoading) {
    return (
      <Fullpage>
        <Spinner />
      </Fullpage>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
