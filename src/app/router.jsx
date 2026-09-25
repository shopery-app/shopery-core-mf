import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/routing/ProtectedRoute";
import PublicRoute from "../components/routing/PublicRoute";
import AdminRoute from "../components/routing/AdminRoute";
import { PageSpinner } from "../components/ui/Feedback";

const HomePage = lazy(() => import("../features/home/HomePage"));
const NotFoundPage = lazy(() => import("../features/misc/NotFoundPage"));

const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
const ConfirmEmailPage = lazy(() => import("../features/auth/ConfirmEmailPage"));
const ForgotPasswordPage = lazy(() => import("../features/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../features/auth/ResetPasswordPage"));

const ProductsPage = lazy(() => import("../features/products/ProductsPage"));
const ProductDetailPage = lazy(() => import("../features/products/ProductDetailPage"));

const ShopsPage = lazy(() => import("../features/shops/ShopsPage"));
const ShopDetailPage = lazy(() => import("../features/shops/ShopDetailPage"));

const CartPage = lazy(() => import("../features/cart/CartPage"));
const PaymentSuccessPage = lazy(() => import("../features/cart/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("../features/cart/PaymentCancelPage"));

const WishlistPage = lazy(() => import("../features/wishlist/WishlistPage"));
const OrdersPage = lazy(() => import("../features/orders/OrdersPage"));

const ProfileOverviewPage = lazy(() => import("../features/account/ProfileOverviewPage"));
const AddressesPage = lazy(() => import("../features/account/AddressesPage"));
const SettingsPage = lazy(() => import("../features/account/SettingsPage"));

const BlogsPage = lazy(() => import("../features/blogs/BlogsPage"));
const BlogDetailPage = lazy(() => import("../features/blogs/BlogDetailPage"));
const MyBlogsPage = lazy(() => import("../features/blogs/MyBlogsPage"));
const LikedBlogsPage = lazy(() => import("../features/blogs/LikedBlogsPage"));
const SavedBlogsPage = lazy(() => import("../features/blogs/SavedBlogsPage"));
const ArchivedBlogsPage = lazy(() => import("../features/blogs/ArchivedBlogsPage"));
const EditBlogPage = lazy(() => import("../features/blogs/EditBlogPage"));

const ShopDashboardPage = lazy(() => import("../features/merchant/ShopDashboardPage"));

const AdminLoginPage = lazy(() => import("../features/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("../features/admin/AdminDashboardPage"));

const AppRouter = () => (
  <Suspense fallback={<PageSpinner />}>
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/signin" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Catalog */}
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shop/:shopId" element={<ShopDetailPage />} />

      {/* Cart & checkout */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />

      {/* Buyer account */}
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileOverviewPage /></ProtectedRoute>} />
      <Route path="/profile/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
      <Route path="/profile/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Blogs */}
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/:blogId" element={<BlogDetailPage />} />
      <Route path="/blogs/me" element={<ProtectedRoute><MyBlogsPage /></ProtectedRoute>} />
      <Route path="/blogs/liked" element={<ProtectedRoute><LikedBlogsPage /></ProtectedRoute>} />
      <Route path="/blogs/saved" element={<ProtectedRoute><SavedBlogsPage /></ProtectedRoute>} />
      <Route path="/blogs/archived" element={<ProtectedRoute><ArchivedBlogsPage /></ProtectedRoute>} />
      <Route path="/blogs/edit/:blogId" element={<ProtectedRoute><EditBlogPage /></ProtectedRoute>} />

      {/* Merchant */}
      <Route path="/shop/dashboard" element={<ProtectedRoute><ShopDashboardPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admins" element={<AdminLoginPage />} />
      <Route path="/admins/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

      {/* Legacy redirects */}
      <Route path="/customer/profile" element={<Navigate to="/profile" replace />} />
      <Route path="/customer/products" element={<Navigate to="/products" replace />} />
      <Route path="/customer/blog" element={<Navigate to="/blogs" replace />} />
      <Route path="/customer/support" element={<Navigate to="/profile/settings?tab=support" replace />} />
      <Route path="/merchant/shops/:shopId/dashboard" element={<Navigate to="/shop/dashboard" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
