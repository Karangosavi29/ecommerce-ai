import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import useWishlistStore from "@/store/wishlistStore";
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
import AIChatButton from "./components/ai/AIChatButton";
import ScrollToTop from "./components/shared/ScrollToTop";
import TopLoadingBar from "@/components/shared/TopLoadingBar";
import Wishlist from "@/pages/Wishlist";


function App() {
  const { checkAuth, isAuthenticated } = useAuth();
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <TopLoadingBar />
      <Toaster position="top-center" />
      <AIChatButton />
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
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
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