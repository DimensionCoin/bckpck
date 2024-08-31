import React, { useEffect, useState } from "react";
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
import { PiHandDepositFill } from "react-icons/pi";
import { loadStripeOnramp } from "@stripe/crypto";
import {
  CryptoElements,
  OnrampElement,
} from "../../context/StripeCryptoElements";
import { useUser } from "@/context/UserContext";

const stripeOnrampPromise = loadStripeOnramp(
  "pk_test_51NgibfJuqtOkpcc8C89WXH2VXzS6BnbqpvfwXkh8Y1Zpdx7HrFiP0B1wVAj924PSKoxqUYfyRTsDtTgzSsEaiJUL00ei3uB9ef"
);

const DepositButton = () => {
  const { user } = useUser();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (user && user.walletAddress) {
      const fetchClientSecret = async () => {
        try {
          const response = await fetch("/api/onramp-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress: user.walletAddress }),
          });

          const data = await response.json();
          setClientSecret(data.client_secret);
        } catch (error) {
          console.error("Error fetching client secret:", error);
        }
      };

      fetchClientSecret();
    }
  }, [user]);

  return (
    <Drawer>
      <DrawerTrigger className="w-full flex items-center justify-center gap-1 bg-[#2d2d2d] text-white rounded-lg p-2 text-sm">
        <PiHandDepositFill className="text-xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Deposit Funds</DrawerTitle>
          <DrawerDescription>
            Use the form below to deposit funds via Stripe.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          {clientSecret ? (
            <CryptoElements stripeOnramp={stripeOnrampPromise}>
              <OnrampElement
                clientSecret={clientSecret}
                appearance={{ theme: "dark" }}
                onReady={() => console.log("Onramp Element Ready")}
                onChange={(event: any) =>
                  console.log("Onramp Element Change:", event)
                }
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "360px",
                  maxHeight: "500px",
                  margin: "0 auto",
                }}
              />
            </CryptoElements>
          ) : (
            <p>Loading...</p>
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

export default DepositButton;
