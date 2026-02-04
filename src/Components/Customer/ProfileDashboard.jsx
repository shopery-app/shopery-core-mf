import React, { useState, useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "../../CSS/ProfileDashboard.css";
import { isAuthenticated, logout } from "../../utils/auth";
import { Navigate } from "react-router-dom";
import { apiURL } from "../../Backend/Api/api";
import axios from "axios";

const initialState = {
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAddress, setCurrentAddress] = useState({});
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

  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const countries = [
    {
      value: "AZ",
      label: "Azerbaijan",
      code: "+994",
      flag: "🇦🇿",
      phoneLength: 9,
      pattern: /^[0-9]{9}$/,
    },
    {
      value: "TR",
      label: "Turkey",
      code: "+90",
      flag: "🇹🇷",
      phoneLength: 10,
      pattern: /^[0-9]{10}$/,
    },
    {
      value: "US",
      label: "United States",
      code: "+1",
      flag: "🇺🇸",
      phoneLength: 10,
      pattern: /^[0-9]{10}$/,
    },
    {
      value: "RU",
      label: "Russia",
      code: "+7",
      flag: "🇷🇺",
      phoneLength: 10,
      pattern: /^[0-9]{10}$/,
    },
  ];

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);

    setTimeout(() => {
      setShowErrorMessage(false);
      setErrorMessage("");
    }, 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessMessage("");
    }, 5000);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;

    const cleanPhone = phone.replace(/[\s\-()]/g, "");

    const country = countries.find((c) => c.value === selectedCountry);

    if (!country) return false;

    if (cleanPhone.startsWith(country.code)) {
      const phoneWithoutCode = cleanPhone.substring(country.code.length);
      return country.pattern.test(phoneWithoutCode);
    }

    if (cleanPhone.startsWith("0")) {
      const phoneWithoutZero = cleanPhone.substring(1);
      return country.pattern.test(phoneWithoutZero);
    }

    return country.pattern.test(cleanPhone);
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.get(`${apiURL}/users/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "OK" && response.data.data) {
        const userData = response.data.data;
        setCurrentUser(userData);
        if (userData.profilePhotoUrl) {
          setProfilePhotoUrl(userData.profilePhotoUrl);
        }

        dispatch ({ type: "SET_INITIAL_DATA", data: userData });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);

      if (error.response?.status === 401) {
        logout();
        navigate("/signin");
      } else {
        setError("Failed to fetch user profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updateData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await axios.put(
        `${apiURL}/users/me/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === "OK") {
        await fetchUserProfile();
        setShowEditProfileModal(false);
        setSuccessMessage("Profile updated successfully!");
        setValidationErrors({});

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setValidationErrors({
          general: "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/signin");
      } else if (error.response?.data?.message) {
        setValidationErrors({
          general: error.response.data.message,
        });
      } else {
        setValidationErrors({
          general: "Failed to update profile. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${apiURL}/users/me/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "OK") {
        const newPresignedURL = response.data.data;
        setProfilePhotoUrl(newPresignedURL);
        setCurrentUser((prevUser) => ({
          ...prevUser,
          profilePhotoUrl: newPresignedURL,
        }))
        setImageLoadError(false);
        showSuccess("Profile image updated successfully!");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/signin");
      } else {
        showError("Failed to update profile image");
      }
    }
  };

  const deleteProfileImage = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.delete(`${apiURL}/users/me/photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "OK") {
        setProfilePhotoUrl(null);
        setImageLoadError(false);

        setCurrentUser((prevUser) => ({
          ...prevUser,
          profilePhotoUrl: null,
        }));

        showSuccess("profile image deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete profile image", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.status === 401) {
        logout();
        navigate("/signin");
      } else {
        showError("Failed to delete profile image");
      }
    }
  };

  const handleGetCurrentAddress = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.get(`${apiURL}/users/me/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "OK" && response.data.data) {
        setCurrentAddress(response.data.data);

        const defaultAddress = response.data.data.find(
          (addr) => addr.default === true,
        );
        setDefaultAddress(defaultAddress || null);
      }
    } catch (error) {
      console.error("error while getting current address", error);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchUserProfile();
      handleGetCurrentAddress();
    } else {
      navigate("/signin");
    }
  }, [authenticated, navigate]);

  if (!authenticated) {
    return <Navigate to="/signin" replace />;
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <div>No user data available</div>;
  }

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
    dispatch({
      type: "UPDATE_FIELD",
      field,
      value,
    });

    if (validationErrors[field]) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [field]: "",
      }));
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateName = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 25) {
      return false;
    }
    if (/\d/.test(trimmedName)) {
      return false;
    }
    return /^[A-Za-zƏÖÜÇŞĞİəıöüçşğ\s]+$/.test(trimmedName);
  };

  const validateField = (field, value) => {
    if (!value) return;

    const validations = {
      firstName: () =>
        !validateName(value) &&
        "First name must be 2-25 characters and contain only letters",
      lastName: () =>
        !validateName(value) &&
        "Last name must be 2-25 characters and contain only letters",
      phone: () => {
        const country = countries.find((c) => c.value === selectedCountry);
        return (
          !validatePhone(value, selectedCountry) &&
          `Please enter a valid ${country?.label} phone number (e.g., ${country?.code})`
        );
      },
    };

    const errorMessage = validations[field]?.();
    if (errorMessage) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: errorMessage,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    setValidationErrors({});
    setSuccessMessage("");

    const errors = {
      ...(formState.firstName &&
        !validateName(formState.firstName) && {
          firstName:
            "First name must be 2-25 characters and contain only letters",
        }),
      ...(formState.lastName &&
        !validateName(formState.lastName) && {
          lastName:
            "Last name must be 2-25 characters and contain only letters",
        }),
      ...(formState.phone &&
        !validatePhone(formState.phone) && {
          phone: "Please enter a valid phone number",
        }),
    };

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const formatPhoneForAPI = (phone, countryCode) => {
      if (!phone) return phone;

      const cleanPhone = phone.replace(/[\s\-()]/g, "");
      const country = countries.find((c) => c.value === countryCode);

      if (cleanPhone.startsWith(country.code)) {
        return cleanPhone;
      }

      if (cleanPhone.startsWith("0")) {
        return country.code + cleanPhone.substring(1);
      }

      return country.code + cleanPhone;
    };

    const updateData = {
      ...(formState.firstName && { firstName: formState.firstName }),
      ...(formState.lastName && { lastName: formState.lastName }),
      ...(formState.phone && {
        phone: formatPhoneForAPI(formState.phone, selectedCountry),
      }),
      ...(formState.dateOfBirth && {
        dateOfBirth: new Date(formState.dateOfBirth).toISOString(),
      }),
    };

    Object.keys(updateData).length > 0
      ? await updateUserProfile(updateData)
      : setShowEditProfileModal(false);
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Please select a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("File size must be less than 5MB.");
        return;
      }
      if (file && file.type.startsWith("image/")) {
        await uploadProfileImage(file);
      }
    }
  };

  const handleImageError = async () => {
    setImageLoadError(true);

    setTimeout(async () => {
      try {
        await fetchUserProfile();
        setImageLoadError(false);
      } catch (error) {
        console.error("Failed to refresh image via profile fetch:", error);
      }
    }, 2000);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
    setImageLoading(false);
  };

  return (
    <>
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
            <div className="flex-shrink-0">
              <i className="fa-solid fa-check-circle text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => {
                setShowSuccessMessage(false);
                setSuccessMessage("");
              }}
              className="flex-shrink-0 text-white hover:text-green-200"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
            <div className="flex-shrink-0">
              <i className="fa-solid fa-exclamation-circle text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => {
                setShowErrorMessage(false);
                setErrorMessage("");
              }}
              className="flex-shrink-0 text-white hover:text-red-200"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <Header />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Profile Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center">
                  <div className="text-center">
                    <div className="relative profile-picture w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      {(currentUser.profilePhotoUrl || profilePhotoUrl) &&
                      !imageLoadError ? (
                        <div className="relative w-full h-full">
                          {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                            </div>
                          )}
                          <img
                            src={currentUser.profilePhotoUrl || profilePhotoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            onLoadStart={() => setImageLoading(true)}
                            style={{
                              display: imageLoadError ? "none" : "block",
                            }}
                          />
                        </div>
                      ) : (
                        <i className="fa-solid fa-user text-3xl text-gray-600"></i>
                      )}
                    </div>

                    {/* Photo action buttons */}
                    <div className="flex justify-center gap-2 mb-4">
                      <button
                        onClick={() =>
                          document.querySelector('input[type="file"]').click()
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                        title="Change photo"
                      >
                        <i className="fa-solid fa-camera text-xs"></i>
                        {currentUser.profilePhotoUrl || profilePhotoUrl
                          ? "Change"
                          : "Upload"}
                      </button>

                      {(currentUser.profilePhotoUrl || profilePhotoUrl) &&
                        !imageLoadError && (
                          <button
                            onClick={() => setShowDeletePhotoModal(true)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-full transition-colors"
                            title="Delete photo"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                            Delete
                          </button>
                        )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />

                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {currentUser.fullName}
                    </h2>
                    {/* ...rest of the content... */}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {currentUser.fullName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {currentUser.email}
                  </p>
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

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Account Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {currentUser.firstName || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {currentUser.lastName || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">{currentUser.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {currentUser.phone || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {currentUser.dateOfBirth
                            ? formatDate(currentUser.dateOfBirth)
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Date
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {formatDate(currentUser.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Default Address
                    </h3>
                    {defaultAddress ? (
                      <div className="address-card p-4 border rounded-lg bg-gray-50">
                        <p className="font-medium">
                          {defaultAddress.addressLine1}
                        </p>
                        {defaultAddress.addressLine2 && (
                          <p className="text-gray-600">
                            {defaultAddress.addressLine2}
                          </p>
                        )}
                        <p className="text-gray-600">
                          {defaultAddress.city}, {defaultAddress.country}{" "}
                          {defaultAddress.postalCode}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Default Address
                        </span>
                      </div>
                    ) : (
                      <div className="no-address p-4 border rounded-lg bg-gray-50">
                        <p className="text-gray-500">No default address set</p>
                        <Link
                          to="/customer/addresses"
                          className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                          Add an address
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ...existing code... */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Quick Actions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/orders"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-box text-gray-600 mr-3"></i>
                    <div>
                      <h4 className="font-medium text-gray-800">My Orders</h4>
                      <p className="text-sm text-gray-600">
                        View order history
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-heart text-gray-600 mr-3"></i>
                    <div>
                      <h4 className="font-medium text-gray-800">Wishlist</h4>
                      <p className="text-sm text-gray-600">Saved items</p>
                    </div>
                  </Link>

                  <Link
                    to="/customer/addresses"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-location-dot text-gray-600 mr-3"></i>
                    <div>
                      <h4 className="font-medium text-gray-800">Addresses</h4>
                      <p className="text-sm text-gray-600">Manage addresses</p>
                    </div>
                  </Link>

                  <Link
                    to="/customer/settings"
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa-solid fa-gear text-gray-600 mr-3"></i>
                    <div>
                      <h4 className="font-medium text-gray-800">Settings</h4>
                      <p className="text-sm text-gray-600">Account settings</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="fa-solid fa-sign-out-alt text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout from your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Edit Profile
              </h3>

              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-800 text-sm font-medium">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    {successMessage}
                  </span>
                </div>
              )}

              {validationErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-800 text-sm font-medium">
                    <i className="fa-solid fa-exclamation-circle mr-2"></i>
                    {validationErrors.general}
                  </span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.firstName}
                    onChange={(e) => {
                      const filteredValue = e.target.value.replace(
                        /[0-9]/g,
                        "",
                      );
                      handleInputChange("firstName", filteredValue);
                      validateField("firstName", filteredValue);
                    }}
                    maxLength={25}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.firstName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {validationErrors.firstName && (
                    <span className="text-red-600 text-sm mt-1 block">
                      <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                      {validationErrors.firstName}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.lastName}
                    onChange={(e) => {
                      const filteredValue = e.target.value.replace(
                        /[0-9]/g,
                        "",
                      );
                      handleInputChange("lastName", filteredValue);
                      validateField("lastName", filteredValue);
                    }}
                    maxLength={25}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.lastName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {validationErrors.lastName && (
                    <span className="text-red-600 text-sm mt-1 block">
                      <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                      {validationErrors.lastName}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        if (validationErrors.phone) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            phone: "",
                          }));
                        }
                      }}
                      className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.flag} {country.value}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      defaultValue={currentUser.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^0-9+\-\s()]/g,
                          "",
                        );
                        handleInputChange("phone", value);
                        validateField("phone", value);
                      }}
                      maxLength={15}
                      className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.phone
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder={`Enter phone number (e.g., ${
                        countries.find((c) => c.value === selectedCountry)?.code
                      })`}
                    />
                  </div>

                  {validationErrors.phone && (
                    <span className="text-red-600 text-sm mt-1 block">
                      <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                      {validationErrors.phone}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    defaultValue={
                      currentUser.dateOfBirth
                        ? new Date(currentUser.dateOfBirth)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    (formState.firstName &&
                      !validateName(formState.firstName)) ||
                    (formState.lastName && !validateName(formState.lastName))
                  }
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    (formState.firstName &&
                      !validateName(formState.firstName)) ||
                    (formState.lastName && !validateName(formState.lastName))
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setShowEditProfileModal(false);
                  setValidationErrors({});
                  setSuccessMessage("");
                }}
                className="mt-4 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="fa-solid fa-trash text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Delete Profile Photo
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your profile photo? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeletePhotoModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteProfileImage();
                    setShowDeletePhotoModal(false);
                  }}
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
