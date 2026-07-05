import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar (desktop) / top bar (mobile) */}
      <aside className="border-b md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            GIRIElectronics
          </Link>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}