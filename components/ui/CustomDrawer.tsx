"use client";

import React, { ReactNode, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";

interface CustomDrawerProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  children,
  open,
  onClose,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <Dialog.Panel className="relative bg-[#272727] w-80 h-full p-4 overflow-y-auto shadow-lg left-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <FaTimes className="h-6 w-6" />
        </button>
        {children}
      </Dialog.Panel>
    </Dialog>
  );
};

export default CustomDrawer;
