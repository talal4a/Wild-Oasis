import { useMutation } from "@tanstack/react-query";

export default function checkin() {
  const {mutate:checkin,}=  useMutation()
  return <div>checkin</div>;
}
