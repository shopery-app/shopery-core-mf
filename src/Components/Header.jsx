import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../Backend/Api/api";
import { isAuthenticated, getCurrentUser, logout } from "../utils/auth";
import useCart from "../hooks/useCart";
import useUserShop from "../hooks/useUserShop";

// ─── Small presentational pieces ────────────────────────────────────────────

const NotificationBanner = memo(({ type, message, onClose }) => (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
          className={`${
              type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
      >
        <i
            className={`fa-solid ${
                type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            } text-xl`}
        />
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          <i className="fa-solid fa-times" />
        </button>
      </div>
    </div>
));
NotificationBanner.displayName = "NotificationBanner";

// ─── Create Shop Modal ───────────────────────────────────────────────────────

const CreateShopModal = memo(({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
    subscriptionTier: "",
  });
  const [errors, setErrors] = useState({});
  const [tiers, setTiers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setTiersLoading(true);
    // Try with auth first, fall back to no-auth (public endpoint)
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
        .get(`${apiURL}/dropdowns/subscription-tiers`, { headers })
        .then((res) => {
          // Accept both wrapped { status, data } and plain array/object shapes
          const data = res.data?.data ?? res.data;
          const tiersArray = Array.isArray(data) ? data : [];
          setTiers(tiersArray);
        })
        .catch((err) => {
          console.error("Failed to load subscription tiers:", err);
          setTiers([]);
        })
        .finally(() => setTiersLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleTier = (name) => {
    setFormData((p) => ({ ...p, subscriptionTier: name }));
    setErrors((p) => ({ ...p, subscriptionTier: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.shopName.trim()) e.shopName = "Shop name is required";
    if (!formData.description.trim()) e.description = "Description is required";
    if (!formData.subscriptionTier) e.subscriptionTier = "Please select a plan";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(`${apiURL}/users/me/shop`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "OK" || res.status === 200 || res.status === 201) {
        onSuccess();
      } else {
        throw new Error(res.data?.message || "Failed to create shop");
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to create shop. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {notification && (
            <NotificationBanner
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
            />
        )}
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Open Your Shop</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-times text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name
              </label>
              <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Enter shop name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.shopName ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.shopName && (
                  <p className="text-red-500 text-sm mt-1">{errors.shopName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your shop"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                      errors.description ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Subscription Tiers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Subscription Tier
              </label>

              {tiersLoading ? (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <i className="fa-solid fa-spinner fa-spin mr-2" />
                    Loading plans...
                  </div>
              ) : tiers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                    <i className="fa-solid fa-exclamation-circle mr-2 text-yellow-500" />
                    No subscription tiers available. Please contact support.
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            onClick={() => handleTier(tier.name)}
                            className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                                formData.subscriptionTier === tier.name
                                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                                    : "border-gray-100 bg-gray-50 hover:border-emerald-200"
                            }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                formData.subscriptionTier === tier.name
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-200 text-gray-600"
                            }`}
                        >
                          {tier.name}
                        </span>
                            <div className="text-emerald-700 font-bold text-sm">
                              ${tier.price}
                            </div>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {tier.features?.map((feat, i) => (
                                <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                                  <i className="fa-solid fa-check text-emerald-500 mt-0.5" />
                                  {feat}
                                </li>
                            ))}
                          </ul>
                          {formData.subscriptionTier === tier.name && (
                              <div className="mt-2 text-center text-emerald-600">
                                <i className="fa-solid fa-circle-check text-lg" />
                              </div>
                          )}
                        </div>
                    ))}
                  </div>
              )}

              {errors.subscriptionTier && (
                  <p className="text-red-500 text-xs mt-2">{errors.subscriptionTier}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={submitting || tiersLoading}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
});
CreateShopModal.displayName = "CreateShopModal";

// ─── Shop Status Button (shown in header) ────────────────────────────────────

const ShopStatusButton = memo(({ shopStatus, shop, onCreateClick, navigate }) => {
  if (shopStatus === "NONE" || shopStatus === "CLOSED") {
    return (
        <button
            onClick={onCreateClick}
            className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
        >
          <i className="fa-solid fa-store mr-2" />
          Start Making Money
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
            NEW
          </span>
        </button>
    );
  }

  if (shopStatus === "PENDING") {
    return (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
          <i className="fa-solid fa-clock animate-pulse" />
          Shop Pending Approval
        </div>
    );
  }

  if (shopStatus === "ACTIVE") {
    return (
        <button
            onClick={() => navigate(`/merchant/shops/${shop.id}/dashboard`)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-full font-bold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
          <i className="fa-solid fa-tachometer-alt" />
          My Shop Dashboard
        </button>
    );
  }

  return null;
});
ShopStatusButton.displayName = "ShopStatusButton";

// ─── Main Header ─────────────────────────────────────────────────────────────

const Header = memo(() => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [openSideBar, setOpenSideBar] = useState(false);

  const { itemCount, toggleCart } = useCart();
  const { shop, shopStatus, refetch } = useUserShop();

  const hamburgerMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const authenticated = useMemo(() => isAuthenticated(), []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/";
  }, []);

  const toggleSideBar = useCallback(() => {
    setOpenSideBar((prev) => {
      const next = !prev;
      if (hamburgerMenuRef.current) {
        hamburgerMenuRef.current.style.transform = next
            ? "translateX(0)"
            : "translateX(-100%)";
        document.body.style.overflow = next ? "hidden" : "auto";
      }
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setOpenSideBar(false);
    if (hamburgerMenuRef.current)
      hamburgerMenuRef.current.style.transform = "translateX(-100%)";
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    if (!openSideBar) return;
    const handler = (e) => {
      if (hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(e.target))
        closeSidebar();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openSideBar, closeSidebar]);

  const handleShopCreated = useCallback(() => {
    setShowCreateModal(false);
    refetch();
    setNotification({
      type: "success",
      message: "Shop submitted! You'll be notified once it's approved.",
    });
    setTimeout(() => setNotification(null), 5000);
  }, [refetch]);

  if (location.pathname === "/confirm-email") return null;

  const NavLinks = (
      <>
        <Link className="font-bold text-sm xl:text-base hover:text-gray-600 transition-colors" to="/">HOME</Link>
        <Link className="font-bold text-sm xl:text-base hover:text-gray-600 transition-colors" to="/products">PRODUCTS</Link>
        <Link className="font-bold text-sm xl:text-base hover:text-gray-600 transition-colors" to="/shops">SHOPS</Link>
        <Link className="font-bold text-sm xl:text-base hover:text-gray-600 transition-colors" to="/blogs">BLOGS</Link>
      </>
  );

  return (
      <>
        {notification && (
            <NotificationBanner
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
            />
        )}

        {showCreateModal && (
            <CreateShopModal
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleShopCreated}
            />
        )}

        <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-40 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-20">
              {/* Left: logo + hamburger + nav */}
              <div className="flex items-center gap-4 lg:gap-8">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-leaf text-white text-xl" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    Shopery
                  </span>
                </Link>

                <button
                    className="lg:hidden p-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    onClick={toggleSideBar}
                >
                  <i className="fa-solid fa-bars text-xl" />
                </button>

                <nav className="hidden lg:flex gap-8 xl:gap-12 items-center">
                  {NavLinks}
                </nav>
              </div>

              {/* Right: shop button + cart + auth */}
              <div className="flex items-center gap-4">
                {/* Shop status button — desktop only, authenticated users */}
                {authenticated && (
                    <div className="hidden lg:block">
                      <ShopStatusButton
                          shopStatus={shopStatus}
                          shop={shop}
                          onCreateClick={() => setShowCreateModal(true)}
                          navigate={navigate}
                      />
                    </div>
                )}

                {/* Cart */}
                <Link to="/cart">
                  <button
                      onClick={toggleCart}
                      className="relative p-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <i className="fa-solid fa-shopping-cart text-xl" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          {itemCount > 99 ? "99+" : itemCount}
                        </span>
                    )}
                  </button>
                </Link>

                {/* Auth */}
                {authenticated ? (
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/profile"
                            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <i className="fa-solid fa-user-circle text-xl" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all shadow-md"
                        >
                          Logout
                        </button>
                      </div>
                      {/* Mobile auth icons */}
                      <div className="flex md:hidden items-center gap-2">
                        <Link to="/profile" className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                          <i className="fa-solid fa-user-circle text-xl" />
                        </Link>
                        <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <i className="fa-solid fa-sign-out-alt text-xl" />
                        </button>
                      </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                      <Link to="/signin" className="hidden sm:block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all">
                        Sign In
                      </Link>
                      <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md">
                        Sign Up
                      </Link>
                    </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <div
            ref={hamburgerMenuRef}
            className="w-64 h-screen p-6 lg:hidden"
            style={{
              transform: "translateX(-100%)",
              transition: "transform 0.3s ease-in-out",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,
              backgroundColor: "white",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
            }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Menu</h3>
            <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700">
              <i className="fa-solid fa-times text-xl" />
            </button>
          </div>

          <ul className="flex flex-col gap-4 list-none mb-6">
            {["/", "/products", "/shops", "/blogs"].map((path, i) => (
                <li key={path}>
                  <Link
                      to={path}
                      className="font-bold text-lg hover:text-gray-600 transition-colors block py-2"
                      onClick={closeSidebar}
                  >
                    {["HOME", "PRODUCTS", "SHOPS", "BLOGS"][i]}
                  </Link>
                </li>
            ))}
          </ul>

          {/* Shop status in sidebar */}
          {authenticated && (
              <div className="mb-4">
                <ShopStatusButton
                    shopStatus={shopStatus}
                    shop={shop}
                    onCreateClick={() => {
                      closeSidebar();
                      setShowCreateModal(true);
                    }}
                    navigate={navigate}
                />
              </div>
          )}

          <div className="border-t pt-4">
            {authenticated ? (
                <div className="space-y-3">
                  <Link
                      to="/profile"
                      className="flex items-center space-x-3 py-2 hover:bg-gray-100 rounded px-2"
                      onClick={closeSidebar}
                  >
                    <i className="fa-solid fa-user text-gray-600" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 py-2 hover:bg-red-50 rounded px-2 w-full text-left text-red-600"
                  >
                    <i className="fa-solid fa-sign-out-alt" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
            ) : (
                <div className="space-y-3">
                  <Link to="/signin" className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300" onClick={closeSidebar}>
                    Sign In
                  </Link>
                  <Link to="/register" className="block w-full text-center bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700" onClick={closeSidebar}>
                    Sign Up
                  </Link>
                </div>
            )}
          </div>
        </div>

        {openSideBar && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-[999] lg:hidden"
                onClick={closeSidebar}
            />
        )}
      </>
  );
});

Header.displayName = "Header";
export default Header;