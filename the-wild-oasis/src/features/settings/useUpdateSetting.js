import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSetting } from "../../services/apiSettings";
import toast from "react-hot-toast";

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  const { mutate: updateSettingMutation, isLoading: isUpdating } = useMutation({
    mutationFn: updateSetting,
    onSuccess: () => {
      toast.success("Settings have been successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { updateSetting: updateSettingMutation, isUpdating };
} 