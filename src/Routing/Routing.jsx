import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import PublicRoute from "../Components/Routes/PublicRoute";
import ProtectedRoute from "../Components/Routes/ProtectedRoute";

import Home from "../Components/Home";
import NotFound from "../Components/NotFound";
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import ConfirmEmail from "../Components/Auth/ConfirmEmail";
import ForgotPassword from "../Components/Auth/ForgotPassword";
import ResetPassword from "../Components/Auth/ResetPassword";

import Shops from "../Components/Merchant/Shops";
import PublicShopDetail from "../Components/Shop/ShopDetail";
import ShopDashboard from "../Components/Merchant/Dashboard/ShopDashboard";

import ProfileDashboard from "../Components/User/ProfileDashboard";
import Addresses from "../Components/User/Addresses";
import Settings from "../Components/User/Settings";
import Support from "../Components/User/Support";

import Products from "../Components/Products/Products";
import CartPage from "../Components/Cart/CartPage";
import WishlistPage from "../Components/Wishlist/WishlistPage";

import Blogs from "../Components/Blogs/Blogs";
import BlogDetail from "../Components/Blogs/BlogDetails";
import LikedBlogs from "../Components/Blogs/LikedBlogs";
import SavedBlogs from "../Components/Blogs/SavedBlogs";
import MyBlogs from "../Components/Blogs/MyBlogs";
import ArchivedBlogs from "../Components/Blogs/ArchivedBlogs";
import EditBlog from "../Components/Blogs/EditBlog";

import AdminLogin from "../Components/Admin/AdminLogin";
import AdminDashboard from "../Components/Admin/AdminDashboard";

import PaymentSuccessPage from "../Components/Cart/PaymentSuccessPage";
import PaymentCancelPage from "../Components/Cart/PaymentCancelPage.jsx";

const AdminProtectedRoute = ({ children }) => {
    const adminAccessToken = localStorage.getItem("adminAccessToken");
    const adminUserStr = localStorage.getItem("adminUser");

    if (!adminAccessToken || !adminUserStr) {
        return <Navigate to="/admins" replace />;
    }

    try {
        const user = JSON.parse(adminUserStr);
        const hasAdmin = user.authorities?.some(
            (auth) => auth === "ADMIN" || auth.authority === "ADMIN"
        );
        if (!hasAdmin) {
            localStorage.removeItem("adminAccessToken");
            localStorage.removeItem("adminUser");
            return <Navigate to="/admins" replace />;
        }
        return children;
    } catch {
        return <Navigate to="/admins" replace />;
    }
};

const AdminLoginWrapper = () => {
    if (localStorage.getItem("adminAccessToken")) {
        return <Navigate to="/admins/dashboard" replace />;
    }
    return <AdminLogin />;
};

const Routing = () => {
    return (
        <Routes>
            {/* ── Admin ── */}
            <Route path="/admins" element={<AdminLoginWrapper />} />
            <Route
                path="/admins/dashboard"
                element={
                    <AdminProtectedRoute>
                        <AdminDashboard />
                    </AdminProtectedRoute>
                }
            />

            {/* ── Public ── */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/signin" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />

            {/* ── Products & Categories ── */}
            <Route path="/products" element={<Products />} />

            {/* ── Cart (full page, no sidebar) ── */}
            <Route path="/cart" element={<CartPage />} />

            {/* ── Wishlist ── */}
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

            {/* ── Shops ── */}
            <Route path="/shops" element={<Shops />} />
            <Route path="/shop/:shopId" element={<PublicShopDetail />} />
            <Route path="/shop/dashboard" element={<ProtectedRoute><ShopDashboard /></ProtectedRoute>} />

            {/* ── User Profile ── */}
            <Route path="/profile" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />
            <Route path="/profile/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            <Route path="/profile/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

            {/* ── Blogs ── */}
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:blogId" element={<BlogDetail />} />
            <Route path="/blogs/me" element={<ProtectedRoute><MyBlogs /></ProtectedRoute>} />
            <Route path="/blogs/archived" element={<ProtectedRoute><ArchivedBlogs /></ProtectedRoute>} />
            <Route path="/blogs/edit/:blogId" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
            <Route path="/blogs/liked" element={<ProtectedRoute><LikedBlogs /></ProtectedRoute>} />
            <Route path="/blogs/saved" element={<ProtectedRoute><SavedBlogs /></ProtectedRoute>} />

            {/* ── Legacy redirects ── */}
            <Route path="/customer/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/merchant/shops/:shopId/dashboard" element={<Navigate to="/shop/dashboard" replace />} />

            {/* ── Payment Success ── */}
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default Routing;