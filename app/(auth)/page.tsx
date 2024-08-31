import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Homepage = () => {
  return (
    <div className="flex gap-5 items-center justify-center mt-6">
      <Button className="text-white">
        <Link href="/signin" className="text-white">
          Login
        </Link>
      </Button>
      <Button className="text-white">
        <Link href="/signup" className="text-white">
          Signup
        </Link>
      </Button>{" "}
    </div>
  );
};

export default Homepage;
