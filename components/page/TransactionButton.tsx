import { Button } from "@headlessui/react";
import Link from "next/link";
import React from "react";
import { FaBoltLightning } from "react-icons/fa6";

const TransactionButton = () => {
  return (
    <Link href="/transactions">
      <Button className="flex items-center justify-center gap-1 bg-[#f46f28] text-white rounded-full p-3">
        <FaBoltLightning className="text-sm" />
      </Button>
    </Link>
  );
};

export default TransactionButton;
