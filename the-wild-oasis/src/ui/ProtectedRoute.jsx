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
  //1.Load authenticated users
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  //3.if there is no authenticated users,redirect to/the login
  useEffect(function () {
    if (!isAuthenticated && !isLoading) navigate("/login");
  }, []);

  //2.show a spinner
  if (isLoading)
    return (
      <Fullpage>
        <Spinner />;
      </Fullpage>
    );
  //4.if there is a user, render the app
  if (isAuthenticated) return children;
}
