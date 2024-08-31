import React from "react";
import InvestmentBundle from "../../../components/page/InvestmentBundle";
import { bundles } from "../../../utils/bundles"; // Assume you have this file for bundle info

const Invest = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Bundles</h1>
      <p className="text-gray-600 mb-6">
        Choose from our curated bundles to easily invest in multiple coins with
        one click.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <InvestmentBundle
            key={bundle.name}
            bundleName={bundle.name}
            coins={bundle.coins}
          />
        ))}
      </div>
    </div>
  );
};

export default Invest;
