import React, { useState, useEffect } from "react";
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
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
import { Button } from "@headlessui/react";
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { RiContactsBook3Fill } from "react-icons/ri";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";



interface TransferButtonProps {
  setBalance: React.Dispatch<React.SetStateAction<number | null>>;
}

interface Contact {
  id: number;
  contactUsername: string;
  contactWalletAddress: string;
  isFavorite: boolean;
}

const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const TransferButton: React.FC<TransferButtonProps> = ({ setBalance }) => {
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const clearFormAndClose = () => {
    setRecipientUsername("");
    setAmount(1);
    setMessage("");
    setTransactionStatus(null);
    setIsDrawerOpen(false);
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user?.username }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchContacts();
    }
  }, [user?.username]);

  const handleSelectContact = async (username: string) => {
    setRecipientUsername(username);
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

  const fetchWalletAddress = async (username: string) => {
    try {
      const response = await fetch("/api/walletaddress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wallet address");
      }

      const data = await response.json();
      return data.walletAddress;
    } catch (error) {
      console.error("Error fetching wallet address:", error);
      throw error;
    }
  };

  const ensureTokenAccountExists = async (
    connection: Connection,
    ownerPublicKey: PublicKey,
    mintAddress: PublicKey,
    payer: Keypair
  ) => {
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintAddress,
      ownerPublicKey,
      false,
      TOKEN_PROGRAM_ID
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
          mintAddress,
          TOKEN_PROGRAM_ID
        )
      );

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("finalized")
      ).blockhash;
      transaction.feePayer = payer.publicKey;
      transaction.sign(payer);

      const signature = await connection.sendTransaction(transaction, [payer], {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction(signature, "confirmed");

      return tokenAccountAddress;
    }
  };

  const logTransaction = async (amount: number, message: string) => {
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionType: "transfer",
          amount,
          message,
          recipientUsername,
        }),
      });
      toast.success("Transactions logged successfully");
    } catch (error) {
      console.error("Error logging transactions:", error);
      toast.error("Failed to log transactions");
    }
  };

  const sendUsdc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setTransactionStatus(null);

    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    try {
      const fromSecretKey = await fetchPrivateKey();
      const fromWallet = Keypair.fromSecretKey(fromSecretKey);

      const toWalletAddress = await fetchWalletAddress(recipientUsername);
      const toPublicKey = new PublicKey(toWalletAddress);

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
          amount * 1e6,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await connection.sendTransaction(
        transaction,
        [fromWallet],
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      await connection.confirmTransaction(signature, "confirmed");

      setTransactionStatus(
        `Transaction successful. View on <a href="https://explorer.solana.com/tx/${signature}?cluster=devnet" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">Solana Explorer</a>.`
      );

      toast.success("Transaction successful");

      await logTransaction(amount, message);
      setBalance((prev) => (prev !== null ? prev - amount : prev));
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("Transaction failed");
      toast.error("Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Drawer>
        <DrawerTrigger
          onClick={toggleDrawer}
          className="w-full flex items-center justify-center gap-1 bg-[#2d2d2d] text-white rounded-lg p-2 text-sm"
        >
          <FaMoneyBillTransfer className="text-xl" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Transfer</DrawerTitle>
            <DrawerDescription>
              Enter the recipient username and amount to transfer.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={sendUsdc} className="space-y-4 p-4">
            <div>
              <label className="block mb-1">Recipient Username:</label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="absolute right-0 top-0 h-full">
                  
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="w-full flex items-center justify-center gap-1 bg-[#2d2d2d] text-white rounded-lg p-2 text-sm">
                          <RiContactsBook3Fill className="text-xl" />
                          
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-4 bg-white rounded-lg shadow-lg">
                        <ul className="space-y-2">
                          {contacts.length === 0 ? (
                            <li>No contacts available</li>
                          ) : (
                            contacts.map((contact) => (
                              <li
                                key={contact.id}
                                className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg"
                                onClick={() =>
                                  handleSelectContact(contact.contactUsername)
                                }
                              >
                                {contact.contactUsername}
                              </li>
                            ))
                          )}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-1">Amount (USDC):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block mb-1">Message (Optional):</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white rounded-lg px-4 py-2"
              >
                {isLoading ? "Processing..." : "Send"}
              </Button>
              <DrawerClose onClick={clearFormAndClose}>
                <Button className="bg-gray-500 text-white rounded-lg px-4 py-2 ml-2">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
          {transactionStatus && (
            <p
              className="mt-4 text-center text-sm"
              dangerouslySetInnerHTML={{ __html: transactionStatus }}
            ></p>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TransferButton;
