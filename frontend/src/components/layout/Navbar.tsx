import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LayoutDashboard, Search, Heart, Landmark, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import { buildWhatsAppUrl } from "@/config/contact";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CATEGORY_LINKS = [
  { label: "Mobiles", slug: "mobiles" },
  { label: "Laptops", slug: "laptops" },
  { label: "Audio", slug: "audio" },
  { label: "TV & Appliances", slug: "tv-appliances" },
  { label: "Accessories", slug: "accessories" },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((s) => s.itemCount);
  const wishlistCount = useWishlistStore((s) => s.ids.length);


  const generalWhatsAppUrl = buildWhatsAppUrl(
    "Hi! I'd like to know more about your products and availability."
  );

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Row 1: logo, search, actions */}
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-foreground">
          GIRI<span className="text-primary">Electronics</span>
        </Link>

        {/* Search - desktop */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products, brands and more"
            aria-label="Search products"
            className="h-10 rounded-full pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/?tab=wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className="relative hidden sm:block">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" aria-label={`Cart, ${itemCount} items`} className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account" className="hidden md:inline-flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name || user?.email || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")}>My Orders</DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Row 2: category links - desktop only */}
      <nav className="hidden border-t border-border md:block" aria-label="Categories">
        <div className="container flex h-11 items-center gap-6 overflow-x-auto no-scrollbar">
          {CATEGORY_LINKS.map((cat) => (
            <Link
              key={cat.slug}
              to={`/?category=${cat.slug}`}
              className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {cat.label}
            </Link>
          ))}

          <span className="h-4 w-px bg-border" aria-hidden="true" />

          <Link
            to="/emi"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Landmark className="h-3.5 w-3.5" />
            EMI
          </Link>

          {generalWhatsAppUrl && (
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-success hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          )}
        </div>
      </nav>

      {/* Mobile search - always visible under 16px padding on small screens */}
      <form onSubmit={handleSearch} className="border-t border-border px-4 py-2.5 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-10 rounded-full pl-9"
          />
        </div>
      </form>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-background shadow-soft-xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <span className="text-base font-bold">Menu</span>
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-1 p-3">
                <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shop by category
                </p>
                {CATEGORY_LINKS.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/?category=${cat.slug}`}
                    className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.label}
                  </Link>
                ))}

                <div className="my-2 h-px bg-border" />

                <Link
                  to="/emi"
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  <Landmark className="h-4 w-4" />
                  EMI Financing
                </Link>

                {generalWhatsAppUrl && (
                  <a
                    href={generalWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-success hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                )}

                <Link
                  to="/?tab=wishlist"
                  className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                        onClick={() => setMobileOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-accent"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="mt-2 flex flex-col gap-2 px-1">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header >
  );
}