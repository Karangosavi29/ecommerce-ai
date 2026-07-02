import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} GIRIElectronics. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <Link to="/orders" className="hover:text-foreground">
            Orders
          </Link>
        </div>
      </div>
    </footer>
  );
}