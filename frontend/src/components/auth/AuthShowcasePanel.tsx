import { ShieldCheck, PackageCheck, Sparkles } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    desc: "Payments protected by Razorpay.",
  },
  {
    icon: PackageCheck,
    title: "Track every order",
    desc: "Real-time status from placed to delivered.",
  },
  {
    icon: Sparkles,
    title: "Curated electronics",
    desc: "Mobiles, laptops, audio and more, all in one place.",
  },
];

/** Desktop-only brand panel — hidden on mobile so the form stays the focus there. */
export function AuthShowcasePanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-blue-800 p-10 text-white lg:flex">
      <div>
        <p className="text-xl font-extrabold tracking-tight">
          GIRI<span className="text-blue-200">Electronics</span>
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {POINTS.map((point) => (
          <div key={point.title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <point.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">{point.title}</p>
              <p className="text-sm text-white/80">{point.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/60">
        © {new Date().getFullYear()} GIRIElectronics. All rights reserved.
      </p>
    </div>
  );
}