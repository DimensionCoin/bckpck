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
import { BsQrCodeScan } from "react-icons/bs";
import QrScanner from "react-qr-scanner";
import { useUser } from "@/context/UserContext";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import toast from "react-hot-toast";

interface QrCodeData {
  amount: string;
  message: string;
  walletAddress: string;
  username: string;
}

const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const ScanQrCode = () => {
  const { user } = useUser();
  const [scanResult, setScanResult] = useState<QrCodeData | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = (data: any) => {
    if (data) {
      const parsedData: QrCodeData = JSON.parse(data.text);
      setScanResult(parsedData);
      setIsScanned(true);
    }
  };

  const handleError = (err: any) => {
    console.error("Error scanning QR Code:", err);
  };

  const fetchPrivateKey = async () => {
    try {
      const response = await fetch("/api/privatekey", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch private key");
      }

      const data = await response.json();
      return Uint8Array.from(data.privateKey);
    } catch (error) {
      console.error("Error fetching private key:", error);
      throw error;
    }
  };

  const ensureTokenAccountExists = async (
    connection: Connection,
    ownerPublicKey: PublicKey,
    mintAddress: PublicKey,
    payer: Keypair
  ): Promise<PublicKey> => {
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintAddress,
      ownerPublicKey
    );

    try {
      await getAccount(connection, tokenAccountAddress);
      return tokenAccountAddress;
    } catch (error) {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          tokenAccountAddress,
          ownerPublicKey,
          mintAddress
        )
      );

      const signature = await connection.sendTransaction(transaction, [payer]);
      await connection.confirmTransaction(signature, "confirmed");

      return tokenAccountAddress;
    }
  };

  const processTransaction = async () => {
    if (scanResult && user) {
      setIsLoading(true);

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      try {
        const fromSecretKey = await fetchPrivateKey();
        const fromWallet = Keypair.fromSecretKey(fromSecretKey);
        const toPublicKey = new PublicKey(scanResult.walletAddress);

        const fromTokenAccount = await ensureTokenAccountExists(
          connection,
          fromWallet.publicKey,
          new PublicKey(USDC_MINT_ADDRESS),
          fromWallet
        );

        const toTokenAccount = await ensureTokenAccountExists(
          connection,
          toPublicKey,
          new PublicKey(USDC_MINT_ADDRESS),
          fromWallet
        );

        const transaction = new Transaction().add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromWallet.publicKey,
            Number(scanResult.amount) * 1e6,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const signature = await connection.sendTransaction(transaction, [
          fromWallet,
        ]);
        await connection.confirmTransaction(signature, "confirmed");

        toast.success(
          `Transaction successful! Sent ${scanResult.amount} USDC to ${scanResult.walletAddress}`
        );

        await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionType: "transfer",
            amount: scanResult.amount,
            message: scanResult.message,
            recipientUsername: scanResult.username,
          }),
        });

        setScanResult(null);
        setIsScanned(false);
      } catch (error) {
        console.error("Transaction failed:", error);
        toast.error("Transaction failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Drawer>
      <DrawerTrigger className="w-full flex items-center justify-center gap-1 bg-[#2d2d2d] text-white rounded-lg p-2 text-sm">
        <BsQrCodeScan className="text-xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Scan QR Code</DrawerTitle>
          <DrawerDescription>
            Scan the QR code to see transaction details.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          {!isScanned ? (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
            />
          ) : (
            scanResult && (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-gray-800">
                  Transaction Details
                </p>
                <p>
                  <strong>Recipient:</strong> {scanResult.username}
                </p>
                <p>
                  <strong>Recipient Wallet:</strong> {scanResult.walletAddress}
                </p>
                <p>
                  <strong>Amount:</strong> {scanResult.amount} USDC
                </p>
                <p>
                  <strong>Message:</strong> {scanResult.message}
                </p>
                <Button
                  onClick={processTransaction}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
                >
                  {isLoading ? "Processing..." : "Confirm and Send"}
                </Button>
              </div>
            )
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

export default ScanQrCode;
