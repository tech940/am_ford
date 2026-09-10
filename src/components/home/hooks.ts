import { useEffect, useState } from "react";

/** True only after the component has mounted on the client — gates window usage for SSR. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
