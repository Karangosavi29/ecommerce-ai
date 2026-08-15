import { useState } from "react";
import { CreditCard, MessageCircle, Landmark, Check, FileCheck, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/config/contact";
import { buildProductEnquiryMessage } from "@/components/product/buildProductEnquiryMessage";
import { cn } from "@/lib/utils";

interface PaymentOptionsPanelProps {
    productName: string;
    price: number;
}

const WHATSAPP_HELP_ITEMS = [
    "Product confirmation",
    "Availability check",
    "Payment assistance",
    "EMI guidance",
];

const FINANCE_PARTNERS = [
    { name: "Bajaj Finance", note: "Flexible EMI plans" },
    { name: "Kotak Finance", note: "Easy approval process" },
];

const APPLY_STEPS = [
    "Visit our store",
    "Select your product",
    "Complete finance verification",
    "Take your product home",
];

const REQUIRED_DOCS = ["ID Proof", "Address Proof", "Required documents"];

export function PaymentOptionsPanel({ productName, price }: PaymentOptionsPanelProps) {
    const [emiExpanded, setEmiExpanded] = useState(false);
    const whatsappUrl = buildWhatsAppUrl(
        buildProductEnquiryMessage({ productName, price })
    );

    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Payment Options</p>

            <div className="space-y-3">
                {/* Pay Online */}
                <div className="group flex gap-3 rounded-lg border border-transparent p-2 transition hover:border-primary/20 hover:bg-primary/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-105">
                        <CreditCard className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">Pay Online</p>
                            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                                <Zap className="h-2.5 w-2.5" />
                                Instant
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Secure payment with UPI, Cards, Net Banking via Razorpay.
                        </p>
                    </div>
                </div>

                {/* WhatsApp pre-sale enquiry */}
                <div className="group flex gap-3 rounded-lg border border-transparent p-2 transition hover:border-success/20 hover:bg-success/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success transition group-hover:scale-105">
                        <MessageCircle className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">Order via WhatsApp</p>
                            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                                Fast reply
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Need help before buying? Chat with our team for product details, availability and
                            payment assistance.
                        </p>

                        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                            {WHATSAPP_HELP_ITEMS.map((item) => (
                                <li key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Check className="h-3 w-3 shrink-0 text-success" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        {whatsappUrl ? (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    buttonVariants({ variant: "outline", size: "sm" }),
                                    "mt-3 gap-1.5 border-success/30 text-success hover:bg-success/10 hover:text-success"
                                )}
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Order via WhatsApp
                            </a>
                        ) : (
                            <p className="mt-3 text-xs italic text-muted-foreground">
                                WhatsApp contact not yet configured.
                            </p>
                        )}
                    </div>
                </div>

                {/* EMI — collapsible */}
                <div className="rounded-lg border border-transparent transition hover:border-warning/20 hover:bg-warning/5">
                    <button
                        type="button"
                        onClick={() => setEmiExpanded((prev) => !prev)}
                        className="group flex w-full items-start gap-3 p-2 text-left"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning transition group-hover:scale-105">
                            <Landmark className="h-4.5 w-4.5" />
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">EMI Available</p>
                                <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                                    No-cost options
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Buy on easy monthly installments. Available through Bajaj Finance and Kotak Finance.
                            </p>
                        </div>
                        <span className="mt-1 shrink-0 text-muted-foreground">
                            {emiExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                    </button>

                    {emiExpanded && (
                        <div className="animate-in fade-in slide-in-from-top-1 space-y-3 px-2 pb-3 duration-150">
                            <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Finance Partners
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {FINANCE_PARTNERS.map((partner) => (
                                        <div
                                            key={partner.name}
                                            className="rounded-md border border-border bg-background px-3 py-2.5 transition hover:border-warning/40"
                                        >
                                            <p className="text-sm font-medium text-foreground">{partner.name}</p>
                                            <p className="text-xs text-muted-foreground">{partner.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    How to Apply
                                </p>
                                <ol className="space-y-1.5">
                                    {APPLY_STEPS.map((step, i) => (
                                        <li key={step} className="flex items-center gap-2 text-sm text-foreground">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/10 text-xs font-semibold text-warning">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
                                <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-semibold text-foreground">Bring with you:</p>
                                    <p className="text-xs text-muted-foreground">{REQUIRED_DOCS.join(" · ")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}