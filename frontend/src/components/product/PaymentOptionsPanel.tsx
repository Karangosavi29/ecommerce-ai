import { CreditCard, MessageCircle, Landmark, Check } from "lucide-react";
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

export function PaymentOptionsPanel({ productName, price }: PaymentOptionsPanelProps) {
    const whatsappUrl = buildWhatsAppUrl(
        buildProductEnquiryMessage({ productName, price })
    );

    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Payment Options</p>

            <div className="space-y-3">
                {/* Pay Online — informational; the actual payment happens at Checkout */}
                <div className="flex gap-3 rounded-md border border-border p-3">
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

                {/* WhatsApp pre-sale enquiry — real wa.me link, no COD claim */}
                <div className="flex gap-3 rounded-md border border-border p-3">
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

                {/* EMI — real in-store service, no online integration implied */}
                <div className="flex gap-3 rounded-md border border-border p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                        <Landmark className="h-4.5 w-4.5" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-foreground">EMI Available</p>
                        <p className="text-xs text-muted-foreground">
                            Buy on easy monthly installments. Available through Bajaj Finance and Kotak Finance.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Visit our store for EMI eligibility and documentation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}