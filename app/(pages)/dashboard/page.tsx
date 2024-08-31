"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import WalletCard from "@/components/page/WalletCard";

const Dashboard = () => {
  const { user } = useUser();
  const displayName = user?.firstName ? user.firstName : user?.username;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <header className="mb-6 w-full max-w-screen-lg text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Welcome, {displayName}!
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Your financial overview at a glance
        </p>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-around w-full max-w-screen-lg space-y-6 md:space-y-0 md:space-x-6">
        <WalletCard />
      </div>
    </div>
  );
};

export default Dashboard;
