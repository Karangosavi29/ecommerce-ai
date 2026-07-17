import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, ExternalLink, LayoutGrid, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/home-sections", label: "Homepage Sections", icon: LayoutGrid },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="border-b border-border bg-card md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-4">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-foreground">
            GIRI<span className="text-primary">Electronics</span>
          </Link>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-border p-2 md:block">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View store
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-background">
        <Outlet />
      </main>
    </div>
  );
}