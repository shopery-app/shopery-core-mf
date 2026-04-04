import React, { useState, useEffect, useReducer, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "../../CSS/ProfileDashboard.css";
import { isAuthenticated, logout } from "../../utils/auth";
import { Navigate } from "react-router-dom";
import { apiURL } from "../../Backend/Api/api";
import axios from "axios";
import useUserShop from "../../hooks/useUserShop";

const initialState = {
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_INITIAL_DATA":
      return {
        ...state,
        firstName: action.data.firstName || "",
        lastName: action.data.lastName || "",
        phone: action.data.phone || "",
        dateOfBirth: action.data.dateOfBirth || "",
      };
    default:
      return state;
  }
};

const ProfileDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, initialState);
  // loading: true while first fetch is in flight; null means "never started"
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("AZ");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  // Track whether profile update is in progress separately from initial load
  const [updating, setUpdating] = useState(false);
  const { shopStatus, loading: shopLoading } = useUserShop();

  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const countries = [
    { value: "AZ", label: "Azerbaijan", code: "+994", flag: "🇦🇿", phoneLength: 9, pattern: /^[0-9]{9}$/ },
    { value: "TR", label: "Turkey", code: "+90", flag: "🇹🇷", phoneLength: 10, pattern: /^[0-9]{10}$/ },
    { value: "US", label: "United States", code: "+1", flag: "🇺🇸", phoneLength: 10, pattern: /^[0-9]{10}$/ },
    { value: "RU", label: "Russia", code: "+7", flag: "🇷🇺", phoneLength: 10, pattern: /^[0-9]{10}$/ },
  ];

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => { setShowErrorMessage(false); setErrorMessage(""); }, 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage(""); }, 5000);
  };

  const validatePhone = useCallback((phone) => {
    if (!phone) return true;
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const country = countries.find((c) => c.value === selectedCountry);
    if (!country) return false;
    if (cleanPhone.startsWith(country.code)) {
      return country.pattern.test(cleanPhone.substring(country.code.length));
    }
    if (cleanPhone.startsWith("0")) {
      return country.pattern.test(cleanPhone.substring(1));
    }
    return country.pattern.test(cleanPhone);
  }, [selectedCountry]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.get(`${apiURL}/users/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accept both wrapped { status, data } and unwrapped shapes
      const userData = response.data?.data ?? response.data;

      if (!userData || typeof userData !== "object" || !userData.email) {
        throw new Error("Unexpected profile response shape");
      }

      setCurrentUser(userData);
      setFetchError(null);

      if (userData.profilePhotoUrl) {
        setProfilePhotoUrl(userData.profilePhotoUrl);
      }

      dispatch({ type: "SET_INITIAL_DATA", data: userData });
    } catch (error) {
      console.error("Profile fetch error:", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/signin");
      } else {
        setFetchError(error.response?.data?.message || "Failed to fetch user profile. Please try again.");
      }
    }
  }, [navigate]);

  const fetchAddresses = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get(`${apiURL}/users/me/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data ?? response.data;
      const addressList = Array.isArray(data) ? data : [];
      const def = addressList.find((addr) => addr.default === true);
      setDefaultAddress(def || null);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!authenticated) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    Promise.all([fetchUserProfile(), fetchAddresses()]).finally(() => {
      setLoading(false);
    });
  }, [authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!authenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Show spinner while first fetch is running
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
    );
  }

  // Show retry screen only if fetch actually failed (not just "not loaded yet")
  if (fetchError) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{fetchError}</p>
            <button
                onClick={() => {
                  setFetchError(null);
                  setLoading(true);
                  fetchUserProfile().finally(() => setLoading(false));
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  // If profile is null after a successful fetch (edge case), show a sensible message
  if (!currentUser) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Could not load your profile data.</p>
            <button
                onClick={() => {
                  setLoading(true);
                  fetchUserProfile().finally(() => setLoading(false));
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInputChange = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (successMessage) setSuccessMessage("");
  };

  const validateName = (name) => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 25) return false;
    if (/\d/.test(trimmed)) return false;
    return /^[A-Za-zƏÖÜÇŞĞİəıöüçşğ\s]+$/.test(trimmed);
  };

  const validateField = (field, value) => {
    if (!value) return;
    const validations = {
      firstName: () => !validateName(value) && "First name must be 2-25 characters and contain only letters",
      lastName: () => !validateName(value) && "Last name must be 2-25 characters and contain only letters",
      phone: () => {
        const country = countries.find((c) => c.value === selectedCountry);
        return !validatePhone(value) && `Please enter a valid ${country?.label} phone number`;
      },
    };
    const msg = validations[field]?.();
    if (msg) setValidationErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const updateUserProfile = async (updateData) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      const response = await axios.put(`${apiURL}/users/me/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.data.status === "OK" || response.status === 200) {
        await fetchUserProfile();
        setShowEditProfileModal(false);
        setValidationErrors({});
        showSuccess("Profile updated successfully!");
      } else {
        setValidationErrors({ general: "Failed to update profile. Please try again." });
      }
    } catch (error) {
      if (error.response?.status === 401) { logout(); navigate("/signin"); }
      else setValidationErrors({ general: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setUpdating(false);
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${apiURL}/users/me/photo`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "OK" || response.status === 200) {
        const newUrl = response.data.data ?? response.data;
        if (typeof newUrl === "string") {
          setProfilePhotoUrl(newUrl);
          setCurrentUser((prev) => ({ ...prev, profilePhotoUrl: newUrl }));
        }
        setImageLoadError(false);
        showSuccess("Profile image updated successfully!");
      }
    } catch (error) {
      if (error.response?.status === 401) { logout(); navigate("/signin"); }
      else showError("Failed to update profile image");
    }
  };

  const deleteProfileImage = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) { navigate("/signin"); return; }

      const response = await axios.delete(`${apiURL}/users/me/photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "OK" || response.status === 200) {
        setProfilePhotoUrl(null);
        setImageLoadError(false);
        setCurrentUser((prev) => ({ ...prev, profilePhotoUrl: null }));
        showSuccess("Profile image deleted successfully!");
      }
    } catch (error) {
      if (error.response?.status === 401) { logout(); navigate("/signin"); }
      else showError("Failed to delete profile image");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setSuccessMessage("");

    const errors = {
      ...(formState.firstName && !validateName(formState.firstName) && { firstName: "First name must be 2-25 characters and contain only letters" }),
      ...(formState.lastName && !validateName(formState.lastName) && { lastName: "Last name must be 2-25 characters and contain only letters" }),
      ...(formState.phone && !validatePhone(formState.phone) && { phone: "Please enter a valid phone number" }),
    };

    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }

    const formatPhone = (phone, countryCode) => {
      if (!phone) return phone;
      const clean = phone.replace(/[\s\-()]/g, "");
      const country = countries.find((c) => c.value === countryCode);
      if (clean.startsWith(country.code)) return clean;
      if (clean.startsWith("0")) return country.code + clean.substring(1);
      return country.code + clean;
    };

    const updateData = {
      ...(formState.firstName && { firstName: formState.firstName }),
      ...(formState.lastName && { lastName: formState.lastName }),
      ...(formState.phone && { phone: formatPhone(formState.phone, selectedCountry) }),
      ...(formState.dateOfBirth && { dateOfBirth: new Date(formState.dateOfBirth).toISOString() }),
    };

    if (Object.keys(updateData).length > 0) {
      await updateUserProfile(updateData);
    } else {
      setShowEditProfileModal(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { showError("File size must be less than 5MB."); return; }
    await uploadProfileImage(file);
  };

  const handleImageError = async () => {
    setImageLoadError(true);
    setTimeout(async () => {
      try {
        await fetchUserProfile();
        setImageLoadError(false);
      } catch { /* ignore */ }
    }, 2000);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
    setImageLoading(false);
  };

  const photoUrl = currentUser.profilePhotoUrl || profilePhotoUrl;

  return (
      <>
        {showSuccessMessage && (
            <div className="fixed top-4 right-4 z-50 max-w-sm">
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
                <i className="fa-solid fa-check-circle text-xl flex-shrink-0" />
                <p className="font-medium flex-1">{successMessage}</p>
                <button onClick={() => setShowSuccessMessage(false)} className="flex-shrink-0 text-white hover:text-green-200">
                  <i className="fa-solid fa-times" />
                </button>
              </div>
            </div>
        )}

        {showErrorMessage && (
            <div className="fixed top-4 right-4 z-50 max-w-sm">
              <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
                <i className="fa-solid fa-exclamation-circle text-xl flex-shrink-0" />
                <p className="font-medium flex-1">{errorMessage}</p>
                <button onClick={() => setShowErrorMessage(false)} className="flex-shrink-0 text-white hover:text-red-200">
                  <i className="fa-solid fa-times" />
                </button>
              </div>
            </div>
        )}

        <Header />
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    {/* Profile photo */}
                    <div className="relative profile-picture w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      {photoUrl && !imageLoadError ? (
                          <div className="relative w-full h-full">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600" />
                                </div>
                            )}
                            <img
                                src={photoUrl}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                                onLoadStart={() => setImageLoading(true)}
                                style={{ display: imageLoadError ? "none" : "block" }}
                            />
                          </div>
                      ) : (
                          <i className="fa-solid fa-user text-3xl text-gray-600" />
                      )}
                    </div>

                    {/* Photo action buttons */}
                    <div className="flex justify-center gap-2 mb-4">
                      <button
                          onClick={() => document.querySelector('input[type="file"]').click()}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                      >
                        <i className="fa-solid fa-camera text-xs" />
                        {photoUrl ? "Change" : "Upload"}
                      </button>
                      {photoUrl && !imageLoadError && (
                          <button
                              onClick={() => setShowDeletePhotoModal(true)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-full transition-colors"
                          >
                            <i className="fa-solid fa-trash text-xs" />
                            Delete
                          </button>
                      )}
                    </div>

                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />

                    <h2 className="text-xl font-bold text-gray-800 mb-1">{currentUser.fullName}</h2>
                    <p className="text-gray-600 text-sm mb-4">{currentUser.email}</p>
                    <div className="flex flex-col gap-2">
                      <button
                          className="bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                          onClick={() => setShowEditProfileModal(true)}
                      >
                        Edit Profile
                      </button>
                      <button
                          onClick={() => setShowLogoutModal(true)}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Account Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{currentUser.firstName || "Not set"}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{currentUser.lastName || "Not set"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{currentUser.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{currentUser.phone || "Not set"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">
                            {currentUser.dateOfBirth ? formatDate(currentUser.dateOfBirth) : "Not set"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{formatDate(currentUser.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Default Address</h3>
                      {defaultAddress ? (
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <p className="font-medium">{defaultAddress.addressLine1}</p>
                            {defaultAddress.addressLine2 && <p className="text-gray-600">{defaultAddress.addressLine2}</p>}
                            <p className="text-gray-600">{defaultAddress.city}, {defaultAddress.country} {defaultAddress.postalCode}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Default Address</span>
                          </div>
                      ) : (
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">No default address set</p>
                            <Link to="/profile/addresses" className="text-blue-600 hover:underline mt-2 inline-block">
                              Add an address
                            </Link>
                          </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { to: "/orders", icon: "fa-box", title: "My Orders", desc: "View order history" },
                      { to: "/wishlist", icon: "fa-heart", title: "Wishlist", desc: "Saved items" },
                      { to: "/profile/addresses", icon: "fa-location-dot", title: "Addresses", desc: "Manage addresses" },
                      { to: "/profile/settings", icon: "fa-gear", title: "Settings", desc: "Account settings" },
                    ].map(({ to, icon, title, desc }) => (
                        <Link key={to} to={to} className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <i className={`fa-solid ${icon} text-gray-600 mr-3`} />
                          <div>
                            <h4 className="font-medium text-gray-800">{title}</h4>
                            <p className="text-sm text-gray-600">{desc}</p>
                          </div>
                        </Link>
                    ))}
                  </div>
                </div>

                {/* ── Shop section ── */}
                {!shopLoading && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-store text-emerald-600" />
                        My Shop
                      </h3>

                      {shopStatus === "NONE" && (
                          <div className="text-center py-4">
                            <p className="text-gray-600 mb-4 text-sm">
                              Turn your passion into profit. Open a shop and start selling today.
                            </p>
                            <button
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem("accessToken");
                                    await axios.post(
                                        `${apiURL}/users/me/shop`,
                                        {},
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    showSuccess("Shop request submitted! Awaiting admin approval.");
                                  } catch (err) {
                                    showError(
                                        err.response?.data?.message || "Failed to submit shop request."
                                    );
                                  }
                                }}
                                className="bg-emerald-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                            >
                              <i className="fa-solid fa-rocket" />
                              Start Making Money
                            </button>
                          </div>
                      )}

                      {shopStatus === "PENDING" && (
                          <div className="flex items-start gap-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <i className="fa-solid fa-clock text-yellow-500 text-2xl mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-yellow-800">Pending Approval</p>
                              <p className="text-yellow-700 text-sm mt-1">
                                Your shop application is under review. We'll notify you once an admin approves it.
                              </p>
                            </div>
                          </div>
                      )}

                      {shopStatus === "ACTIVE" && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                            <i className="fa-solid fa-circle-check" /> Active
                          </span>
                              <span className="text-gray-600 text-sm">Your shop is live!</span>
                            </div>
                            <Link
                                to="/shop/dashboard"
                                className="bg-emerald-600 text-white py-2 px-5 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                            >
                              <i className="fa-solid fa-gauge-high" />
                              Go to Dashboard
                            </Link>
                          </div>
                      )}

                      {shopStatus === "REJECTED" && (
                          <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <i className="fa-solid fa-circle-xmark text-red-500 text-2xl mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-red-800">Shop Application Rejected</p>
                              <p className="text-red-700 text-sm mt-1">
                                Unfortunately your shop application was not approved. Contact support for more details.
                              </p>
                            </div>
                          </div>
                      )}
                    </div>
                )}

              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <i className="fa-solid fa-arrow-left mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <i className="fa-solid fa-sign-out-alt text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</h3>
                  <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleLogout} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Profile</h3>

                  {validationErrors.general && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-800 text-sm font-medium">
                    <i className="fa-solid fa-exclamation-circle mr-2" />
                    {validationErrors.general}
                  </span>
                      </div>
                  )}

                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">First Name</label>
                      <input
                          type="text"
                          defaultValue={currentUser.firstName}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[0-9]/g, "");
                            handleInputChange("firstName", v);
                            validateField("firstName", v);
                          }}
                          maxLength={25}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.firstName ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                          placeholder="Enter your first name"
                      />
                      {validationErrors.firstName && (
                          <span className="text-red-600 text-sm mt-1 block">
                      <i className="fa-solid fa-exclamation-triangle mr-1" />{validationErrors.firstName}
                    </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Last Name</label>
                      <input
                          type="text"
                          defaultValue={currentUser.lastName}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[0-9]/g, "");
                            handleInputChange("lastName", v);
                            validateField("lastName", v);
                          }}
                          maxLength={25}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.lastName ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                          placeholder="Enter your last name"
                      />
                      {validationErrors.lastName && (
                          <span className="text-red-600 text-sm mt-1 block">
                      <i className="fa-solid fa-exclamation-triangle mr-1" />{validationErrors.lastName}
                    </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                            value={selectedCountry}
                            onChange={(e) => {
                              setSelectedCountry(e.target.value);
                              if (validationErrors.phone) setValidationErrors((p) => ({ ...p, phone: "" }));
                            }}
                            className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {countries.map((c) => (
                              <option key={c.value} value={c.value}>{c.flag} {c.value}</option>
                          ))}
                        </select>
                        <input
                            type="tel"
                            defaultValue={currentUser.phone}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                              handleInputChange("phone", v);
                              validateField("phone", v);
                            }}
                            maxLength={15}
                            className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validationErrors.phone ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                            placeholder={`${countries.find((c) => c.value === selectedCountry)?.code}`}
                        />
                      </div>
                      {validationErrors.phone && (
                          <span className="text-red-600 text-sm mt-1 block">
                      <i className="fa-solid fa-exclamation-triangle mr-1" />{validationErrors.phone}
                    </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Date of Birth</label>
                      <input
                          type="date"
                          defaultValue={currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                        type="submit"
                        disabled={updating || (formState.firstName && !validateName(formState.firstName)) || (formState.lastName && !validateName(formState.lastName))}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                            updating || (formState.firstName && !validateName(formState.firstName)) || (formState.lastName && !validateName(formState.lastName))
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      {updating ? (
                          <span className="flex items-center justify-center">
                      <i className="fa-solid fa-spinner fa-spin mr-2" />Saving...
                    </span>
                      ) : "Save Changes"}
                    </button>
                  </form>

                  <button
                      onClick={() => { setShowEditProfileModal(false); setValidationErrors({}); }}
                      className="mt-4 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Delete Photo Modal */}
        {showDeletePhotoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <i className="fa-solid fa-trash text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Profile Photo</h3>
                  <p className="text-gray-600 mb-6">Are you sure you want to delete your profile photo? This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeletePhotoModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                      Cancel
                    </button>
                    <button
                        onClick={async () => { await deleteProfileImage(); setShowDeletePhotoModal(false); }}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        <Footer />
      </>
  );
};

export default ProfileDashboard;