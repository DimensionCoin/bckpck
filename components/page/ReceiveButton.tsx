import { Button } from "@headlessui/react";
import React from "react";
import { FaPlus } from "react-icons/fa";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const ReceiveButton = () => {
  return (
    <Drawer>
      <DrawerTrigger className="w-full flex items-center justify-center gap-1 bg-[#2d2d2d] text-white rounded-lg p-2 text-xs">
        <FaPlus className="text-xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReceiveButton;
