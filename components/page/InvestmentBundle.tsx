"use client";
import React, { useState } from "react";
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
import toast from "react-hot-toast";

type Coin = {
  name: string;
  ticker: string;
  logo?: string;
};

type InvestmentBundleProps = {
  bundleName: string;
  coins: Coin[];
};

const InvestmentBundle: React.FC<InvestmentBundleProps> = ({
  bundleName,
  coins,
}) => {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvestmentAmount(e.target.value);
  };

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid investment amount.");
      return;
    }

    const amountPerCoin = amount / coins.length;

    let message = `Investing $${amount} into the ${bundleName} bundle:\n\n`;

    coins.forEach((coin) => {
      message += `• $${amountPerCoin.toFixed(2)} into ${coin.name} (${
        coin.ticker
      })\n`;
    });

    setReceiptMessage(message);
    setIsDrawerOpen(true);
  };

  const handleBuyBundle = () => {
    coins.forEach((coin) => {
      console.log(
        `Investing $${(parseFloat(investmentAmount) / coins.length).toFixed(
          2
        )} into ${coin.name} (${coin.ticker})`
      );
    });

    toast.success("Transaction successful!");
    setIsDrawerOpen(false);
    setInvestmentAmount(""); // Reset the input after the investment
  };

  return (
    <div className="border p-4 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4">{bundleName}</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {coins.map((coin) => (
          <div key={coin.ticker} className="flex items-center space-x-2">
            <img
              src={
                coin.logo && coin.logo.trim()
                  ? coin.logo
                  : "https://fastly.picsum.photos/id/318/150/150.jpg?hmac=fQiJMNU9bV3PZzbhdyJ33H_rXFA0GYrWhDhCEKWMqkM"
              }
              alt={coin.name}
              className="w-8 h-8 rounded-full"
            />

            <span className="font-semibold">${coin.ticker}</span>
          </div>
        ))}
      </div>
      <input
        type="number"
        value={investmentAmount}
        onChange={handleInputChange}
        placeholder="Amount to Invest"
        className="w-full p-2 border rounded-lg mb-4"
      />
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger>
          <button
            onClick={handleInvest}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          >
            Invest
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Investment Receipt</DrawerTitle>
            <DrawerDescription>
              {receiptMessage.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <button
              onClick={handleBuyBundle}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Buy Bundle
            </button>
            <DrawerClose>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default InvestmentBundle;
