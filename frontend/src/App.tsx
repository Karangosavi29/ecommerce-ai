import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import useWishlistStore from "@/store/wishlistStore";
import Spinner from "@/components/shared/Spinner";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import EMIInfo from "@/pages/EMIInfo";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminHomeSections from "@/pages/admin/AdminHomeSections";
import AdminCoupons from "@/pages/admin/AdminCoupons";

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuth();
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Storefront — wrapped in the customer Navbar/Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/emi" element={<EMIInfo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        {/* Admin panel — its own sidebar layout, no storefront Navbar/Footer */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="home-sections" element={<AdminHomeSections />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;