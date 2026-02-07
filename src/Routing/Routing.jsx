import React from "react";
import { Route, Routes } from "react-router-dom";
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
import Blogs from "../Components/Merchant/Blogs";
import BlogDetail from "../Components/Blogs/BlogDetail";

import PublicShopDetail from "../Components/Shop/ShopDetail";
import ShopDashboard from "../Components/Merchant/Dashboard/ShopDashboard";
import ProfileDashboard from "../Components/Customer/ProfileDashboard";
import Products from "../Components/Products/Products";
import CategoryProducts from "../Components/Products/CategoryProducts";
import CartDisplay from "../Components/Cart/CartDisplay";

const Routing = () => {
  const userMode = localStorage.getItem("appMode");
  return (
    <Routes>
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
