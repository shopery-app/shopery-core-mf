import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import PublicRoute from "../Components/Routes/PublicRoute";
import Home from "../Components/Home";
import NotFound from "../Components/NotFound";
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import ConfirmEmail from "../Components/Auth/ConfirmEmail";
import ForgotPassword from "../Components/Auth/ForgotPassword";
import ResetPassword from "../Components/Auth/ResetPassword";
import MerchantRoutes from "./MerchantRoutes";
import CustomerRoutes from "./CustomerRoutes";
import Shops from "../Components/Merchant/Shops";
import ProtectedRoute from "../Components/Routes/ProtectedRoute";

import Blogs from "../Components/Blogs/Blogs";
import BlogDetail from "../Components/Blogs/BlogDetails";
import LikedBlogs from "../Components/Blogs/LikedBlogs";
import SavedBlogs from "../Components/Blogs/SavedBlogs";

import PublicShopDetail from "../Components/Shop/ShopDetail";
import ShopDashboard from "../Components/Merchant/Dashboard/ShopDashboard";
import ProfileDashboard from "../Components/Customer/ProfileDashboard";
import Products from "../Components/Products/Products";
import CategoryProducts from "../Components/Products/CategoryProducts";
import CartDisplay from "../Components/Cart/CartDisplay";

import AdminLogin from "../Components/Admin/AdminLogin";
import AdminDashboard from "../Components/Admin/AdminDashboard";

const AdminProtectedRoute = ({ children }) => {
  const adminAccessToken = localStorage.getItem("adminAccessToken");
  const adminUserStr = localStorage.getItem("adminUser");

  if (!adminAccessToken || !adminUserStr) {
    return <Navigate to="/admins" replace />;
  }

  try {
    const user = JSON.parse(adminUserStr);
    const hasAdmin = user.authorities?.some(auth => auth === "ADMIN" || auth.authority === "ADMIN");

    if (!hasAdmin) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminUser");
      return <Navigate to="/admins" replace />;
    }

    return children;
  } catch (error) {
    return <Navigate to="/admins" replace />;
  }
};

const AdminLoginWrapper = () => {
  const adminToken = localStorage.getItem("adminAccessToken");
  
  if (adminToken) {
    return <Navigate to="/admins/dashboard" replace />;
  }
  
  const userToken = localStorage.getItem("accessToken");
  const merchantToken = localStorage.getItem("accessToken");
  if (userToken || merchantToken) {
    return <Navigate to="/" replace />;
  }
  
  return <AdminLogin />;
};

const Routing = () => {
  return (
    <Routes>
      <Route path="/admins" element={<AdminLoginWrapper />} />
      <Route
        path="/admins/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      <Route path="/" element={<Home />} />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route path="/shops" element={<Shops />} />
      <Route path="/shop/:shopId" element={<PublicShopDetail />} />

      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:blogId" element={<BlogDetail />} />
      <Route
        path="/blogs/liked"
        element={
          <ProtectedRoute>
            <LikedBlogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogs/saved"
        element={
          <ProtectedRoute>
            <SavedBlogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/merchant/shops/:shopId/dashboard"
        element={<ShopDashboard />}
      />

      <Route path="/category/:categorySlug" element={<CategoryProducts />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/cart" element={<CartDisplay />} />

      <Route path="/products" element={<Products />} />
      <Route path="/merchant/dashboard" element={<ShopDashboard />} />

      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />

      <Route path="/merchant/*" element={<MerchantRoutes />} />

      <Route path="/customer/*" element={<CustomerRoutes />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Routing;
