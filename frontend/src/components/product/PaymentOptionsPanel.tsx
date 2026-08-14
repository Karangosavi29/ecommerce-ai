import { CreditCard, MessageCircle, Landmark, Check, FileCheck } from "lucide-react";
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
    const whatsappUrl = buildWhatsAppUrl(
        buildProductEnquiryMessage({ productName, price })
    );

    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Payment Options</p>

            <div className="divide-y divide-border">
                {/* Pay Online */}
                <div className="flex gap-3 py-3 first:pt-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CreditCard className="h-4.5 w-4.5" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Pay Online</p>
                        <p className="text-xs text-muted-foreground">
                            Secure payment with UPI, Cards, Net Banking via Razorpay.
                        </p>
                    </div>
                </div>

                {/* WhatsApp pre-sale enquiry */}
                <div className="flex gap-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                        <MessageCircle className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Order via WhatsApp</p>
                        <p className="text-xs text-muted-foreground">
                            Need help before buying? Chat with our team for product details, availability and
                            payment assistance.
                        </p>

                        <ul className="mt-2 space-y-1">
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
                                    "mt-3 gap-1.5"
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

                {/* EMI — merged FinancingOptions content */}
                <div className="flex gap-3 py-3 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                        <Landmark className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">EMI Available</p>
                        <p className="text-xs text-muted-foreground">
                            Buy on easy monthly installments. Available through Bajaj Finance and Kotak Finance.
                        </p>

                        <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Finance Partners
                        </p>
                        <div className="mb-3 grid gap-2 sm:grid-cols-2">
                            {FINANCE_PARTNERS.map((partner) => (
                                <div
                                    key={partner.name}
                                    className="rounded-md border border-border bg-background px-3 py-2"
                                >
                                    <p className="text-sm font-medium text-foreground">{partner.name}</p>
                                    <p className="text-xs text-muted-foreground">{partner.note}</p>
                                </div>
                            ))}
                        </div>

                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            How to Apply
                        </p>
                        <ol className="mb-3 space-y-1.5">
                            {APPLY_STEPS.map((step, i) => (
                                <li key={step} className="flex items-center gap-2 text-sm text-foreground">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>

                        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
                            <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="text-xs font-semibold text-foreground">Bring with you:</p>
                                <p className="text-xs text-muted-foreground">{REQUIRED_DOCS.join(" · ")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}