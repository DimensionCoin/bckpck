import React, { useEffect, useState } from "react";
import TransferButton from "../web3/TransferButton";
import DepositButton from "./DepositButton";
import TransactionButton from "./TransactionButton";
import WithdrawButton from "./WithdrawButton";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useUser } from "@/context/UserContext";
import ReceiveButton from "./ReceiveButton";
import RequestButton from "./RequestButton";
import ScanQrCode from "./ScanQrcode";

const USDC_MINT_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";

const ActionButtons = () => {
  const { user } = useUser();

  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsdcBalance = async () => {
      if (user?.walletAddress) {
        try {
          const connection = new Connection("https://api.devnet.solana.com");
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
  return (
    <section className="flex w-full gap-1">
      <div className="flex-grow">
        <DepositButton />
      </div>
      <div className="flex-grow">
        <WithdrawButton />
      </div>
      <div className="flex-grow">
        <TransferButton setBalance={setUsdcBalance} />
      </div>
      <div className="flex-grow">
        <RequestButton />
      </div>
      <div className="flex-grow">
        <ScanQrCode />
      </div>
    </section>
  );
};

export default ActionButtons;
