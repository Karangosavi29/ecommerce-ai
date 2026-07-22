import { Landmark } from "lucide-react";
import { FinancingOptions } from "@/components/product/FinancingOptions";


export default function EMIInfo() {
  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Landmark className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            EMI Financing
          </h1>
          <p className="text-sm text-muted-foreground">Buy now, pay monthly — in-store</p>
        </div>
      </div>

      <FinancingOptions />
    </div>
  );
}