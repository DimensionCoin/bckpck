import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // Adjust the path if necessary
import { UserProvider } from "@/context/UserContext"; // Ensure UserProvider is included

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth Pages",
  description: "Authentication pages",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
