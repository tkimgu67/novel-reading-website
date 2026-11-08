"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides site chrome (e.g. footer) inside the distraction-free reader. */
export default function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/read/")) return null;
  return <>{children}</>;
}
