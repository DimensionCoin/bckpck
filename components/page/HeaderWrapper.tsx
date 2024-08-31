// components/page/HeaderWrapper.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/page/Header";

const HeaderWrapper: React.FC = () => {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/signin" || pathname === "/signup" || pathname === "/";

  if (isAuthPage) {
    return null;
  }

  return <Header />;
};

export default HeaderWrapper;
