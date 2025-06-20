"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { IStaticMethods } from "preline/preline";
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

export default function PrelineScript() {
  const path = usePathname();

  useEffect(() => {
    const loadPreline = async () => {
      try {
      await import("preline/preline");

      window.HSStaticMethods?.autoInit();
    } catch (error) {
      console.error("Error initializing Preline:", error);
    }
  };
    loadPreline();
  }, [path]);

  return null;
}