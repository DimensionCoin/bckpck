import React, { useState } from "react";
import { Button } from "@headlessui/react";
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
import { GiReceiveMoney } from "react-icons/gi";
import QRCode from "react-qr-code";
import { useUser } from "@/context/UserContext";

const RequestButton = () => {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [qrCodeValue, setQrCodeValue] = useState("");

  const generateQrCode = () => {
    if (amount && message && user?.walletAddress && user?.username) {
      const qrData = JSON.stringify({
        amount,
        message,
        walletAddress: user.walletAddress,
        username: user.username,
      });
      setQrCodeValue(qrData);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger className="w-full flex items-center justify-center gap-1 bg-[#2d2d2d] text-white rounded-lg p-2 text-sm">
        <GiReceiveMoney className="text-xl" />
        
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Request Money</DrawerTitle>
          <DrawerDescription>
            Enter the amount and message, then generate a QR code.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input input-bordered w-full"
          />
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input input-bordered w-full"
          />
          <Button
            onClick={generateQrCode}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Generate QR Code
          </Button>
          {qrCodeValue && (
            <div className="flex justify-center mt-4">
              <QRCode value={qrCodeValue} size={256} />
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button className="bg-gray-500 text-white px-4 py-2 rounded-lg">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RequestButton;
