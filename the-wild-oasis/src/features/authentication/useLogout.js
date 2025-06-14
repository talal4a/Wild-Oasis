import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout as logoutApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
export function useLogout() {
  const navigate = useNavigate();
  const querClient = useQueryClient();
  const { mutata: logout, isLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      querClient.removeQueries();
      navigate("/login", { replace: true });
    },
  });
  return { logout, isLoading };
}
