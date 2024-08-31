import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request) {
  const { walletAddress } = await request.json();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  try {
    // Prepare the request body
    const body = new URLSearchParams({
      "transaction_details[destination_currency]": "usdc",
      "transaction_details[destination_network]": "solana",
      "wallet_addresses[solana]": walletAddress,
      customer_ip_address:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        request.socket.remoteAddress,
    });

    // Make the request to Stripe API
    const response = await fetch(
      "https://api.stripe.com/v1/crypto/onramp_sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const onrampSession = await response.json();

    // Log the response
    console.log("Onramp session created:", onrampSession);

    if (response.ok) {
      return NextResponse.json({ client_secret: onrampSession.client_secret });
    } else {
      throw new Error(
        onrampSession.error.message || "Failed to create onramp session"
      );
    }
  } catch (error) {
    console.error("Error creating onramp session:", error);
    return NextResponse.json(
      { error: "Failed to create onramp session", details: error.message },
      { status: 500 }
    );
  }
}
