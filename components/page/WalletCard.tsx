import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import TransactionButton from "@/components/page/TransactionButton"; // Ensure these components are correctly imported
import ActionButton from "@/components/page/ActionButtons"; // Replace with the correct component name

const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const WalletCard = () => {
  const { user } = useUser();
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsdcBalance = async () => {
      if (user?.walletAddress) {
        try {
          const connection = new Connection(
            "https://devnet.helius-rpc.com/?api-key=2838e058-518a-47c2-b8f8-a4840027ff8a"
          );
          const publicKey = new PublicKey(user.walletAddress);

          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            {
              programId: TOKEN_PROGRAM_ID,
            }
          );

          let usdcBalance = 0;
          tokenAccounts.value.forEach((accountInfo) => {
            const accountData = accountInfo.account.data.parsed.info;
            if (accountData.mint === USDC_MINT_ADDRESS) {
              usdcBalance += parseFloat(accountData.tokenAmount.uiAmountString);
            }
          });

          setUsdcBalance(usdcBalance);
        } catch (error) {
          console.error("Failed to fetch USDC balance:", error);
        }
      }
    };

    fetchUsdcBalance();
  }, [user?.walletAddress]);

  const truncateAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div className="bg-gray-100 flex justify-center items-center">
      <div className="w-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl relative text-white shadow-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-light">Name</p>
            <p className="text-lg font-medium tracking-wide">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "N/A"}
            </p>
            <p className="text-xs font-light mt-1">Wallet Address</p>
            <p className="text-lg font-medium tracking-wide">
              {user?.walletAddress
                ? truncateAddress(user.walletAddress)
                : "N/A"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <TransactionButton />
          </div>
        </div>
        <div>
          <p className="text-xs font-light">Balance</p>
          <p className="text-xl font-bold">
            {usdcBalance !== null
              ? `${usdcBalance.toFixed(2)} USDC`
              : "Loading..."}
          </p>
        </div>
        <div className="flex justify-end items-center">
          <ActionButton />
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
