import { Link } from "react-router-dom";
import { CreditCard, MessageCircle, Landmark } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/config/contact";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-foreground">
              GIRI<span className="text-primary">Electronics</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your trusted store for mobiles, laptops, audio and more.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Shop</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <Link to="/orders" className="hover:text-foreground">My Orders</Link>
              <Link to="/emi" className="hover:text-foreground">EMI Financing</Link>
            </div>
          </div>

          {/* Real, honest payment info — matches what's actually available */}
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="mb-3 text-sm font-semibold text-foreground">Payment Options</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2.5">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  <span className="font-medium text-foreground">Online Payment: </span>
                  We accept secure online payments through Razorpay.
                </p>
              </div>
              <div className="flex gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <p>
                  <span className="font-medium text-foreground">WhatsApp Orders: </span>
                  For product enquiries, bulk orders, or payment assistance, contact our team
                  through WhatsApp.
                  {!WHATSAPP_NUMBER && (
                    <span className="italic"> (contact number not yet configured)</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2.5">
                <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p>
                  <span className="font-medium text-foreground">EMI Finance: </span>
                  EMI facilities are available through Bajaj Finance and Kotak Finance. Visit our
                  store for eligibility verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} GIRIElectronics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}