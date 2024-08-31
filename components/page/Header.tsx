"use client";

import React, { useEffect, useState } from "react";
import { MdBackpack } from "react-icons/md";
import { AiOutlineStock } from "react-icons/ai";
import { RiStockFill } from "react-icons/ri";
import { FaUser, FaWallet, FaGasPump, FaGear } from "react-icons/fa6";
import { useUser } from "@/context/UserContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Connection, PublicKey } from "@solana/web3.js";

const Header = () => {
  const { user, setUser } = useUser();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const router = useRouter();

  const truncateAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Wallet address copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setUser(null);
        router.push("/");
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    const fetchSolBalance = async () => {
      if (user?.walletAddress) {
        try {
          const connection = new Connection("https://api.devnet.solana.com");
          const publicKey = new PublicKey(user.walletAddress);
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
          console.error("Failed to fetch SOL balance:", error);
        }
      }
    };
    fetchSolBalance();
  }, [user?.walletAddress]);

  return (
    <header className="bg-secondary text-secondary-foreground p-4 shadow-lg flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <MdBackpack className="text-2xl" />
          <span className="hidden sm:block text-xl font-bold">BackPac</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/save"
            className="flex items-center gap-1 text-sm sm:text-md hover:text-primary transition"
          >
            <AiOutlineStock className="text-xl sm:text-2xl" />
            <span className="hidden sm:block">Save</span>
          </Link>
          <Link
            href="/invest"
            className="flex items-center gap-1 text-sm sm:text-md hover:text-primary transition"
          >
            <RiStockFill className="text-xl sm:text-2xl" />
            <span className="hidden sm:block">Invest</span>
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger className="flex gap-2 sm:gap-3 items-center p-2 px-3 text-white bg-black rounded-md">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="User Avatar"
                className="w-6 h-6 sm:w-6 sm:h-6 rounded-full object-cover"
              />
            ) : (
              <FaUser className="w-4 h-4 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:block">{user?.username}</span>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col items-center p-4">
              <div
                className="flex gap-3 items-center mb-2 cursor-pointer"
                onClick={() =>
                  user?.walletAddress && copyToClipboard(user.walletAddress)
                }
              >
                <FaWallet />
                <span>
                  {user?.walletAddress
                    ? truncateAddress(user.walletAddress)
                    : "No address"}
                </span>
              </div>
              <div className="flex gap-3 items-center mb-2">
                <FaGasPump />
                <span>
                  {solBalance !== null
                    ? `${solBalance.toFixed(4)} SOL`
                    : "Loading..."}
                </span>
              </div>
              <Button
                variant="outline"
                className="bg-[#2b2b2b] text-white px-4 py-2 rounded-lg shadow-md gap-2 mt-4"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Link href="/settings">
          <FaGear className="h-6 w-6 text-gray-500 hover:text-black transition" />
        </Link>
      </div>
      <Toaster position="top-right" />
    </header>
  );
};

export default Header;
