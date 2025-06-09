import { useEffect, useRef } from "react";

export default function useOutsideClick({
  handler,
  listeningCapturing = true,
}) {
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      console.log("clicked on", e.target);
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    }
    document.addEventListener("click", handleClick, listeningCapturing);
    return () =>
      document.removeEventListener("click", handleClick, listeningCapturing);
  }, [handler, listeningCapturing]);

  return ref;
}
