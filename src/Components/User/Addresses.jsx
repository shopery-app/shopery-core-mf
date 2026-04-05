import React, { useEffect, useReducer, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../../utils/auth";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";

const initialState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  postalCode: "",
  addressType: "",
  default: false,
};

const countries = [
  { value: "", label: "Select Country" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Turkey", label: "Turkey" },
  { value: "United States", label: "United States" },
  { value: "Russia", label: "Russia" },
];

const addressTypes = [
  { value: "", label: "Select Address Type" },
  { value: "HOUSE", label: "House" },
  { value: "OFFICE", label: "Office" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOTEL", label: "Hotel" },
  { value: "OTHER", label: "Other" },
];

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return {
        addressLine1: action.payload.addressLine1 || "",
        addressLine2: action.payload.addressLine2 || "",
        city: action.payload.city || "",
        country: action.payload.country || "",
        postalCode: action.payload.postalCode || "",
        addressType: action.payload.addressType || "",
        default: action.payload.default || false,
      };
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formState, dispatch] = useReducer(formReducer, initialState);

  const [loadingStates, setLoadingStates] = useState({});
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const navigate = useNavigate();

  const showError = useCallback((message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => { setShowErrorMessage(false); setErrorMessage(""); }, 4000);
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage(""); }, 3000);
  }, []);

  const setAddressLoading = useCallback((addressId, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [addressId]: isLoading }));
  }, []);

  const isAddressLoading = useCallback((addressId) => {
    return loadingStates[addressId] || false;
  }, [loadingStates]);

  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { navigate("/signin"); return null; }
    return token;
  }, [navigate]);

  const fetchAddresses = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiURL}/users/me/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data ?? response.data;
      const list = Array.isArray(data) ? data : [];
      setAddresses(list);
    } catch (err) {
      console.error("Addresses fetch error:", err);
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else setError("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, navigate]);

  const addAddress = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    // Validate before submitting
    if (
        !formState.addressLine1.trim() ||
        !formState.city.trim() ||
        !formState.country.trim() ||
        !formState.postalCode.trim() ||
        !formState.addressType.trim()
    ) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setModalSubmitting(true);

      const addressData = {
        addressLine1: formState.addressLine1,
        addressLine2: formState.addressLine2,
        city: formState.city,
        country: formState.country,
        postalCode: formState.postalCode,
        addressType: formState.addressType,
        default: formState.default,
      };

      const response = await axios.post(`${apiURL}/users/me/addresses`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ok = response.data?.status === "OK" || response.status === 200 || response.status === 201;
      if (!ok) throw new Error("Unexpected response from server");

      const newAddress = response.data?.data ?? response.data;

      setAddresses((prev) => {
        if (formState.default) {
          return [...prev.map((a) => ({ ...a, default: false })), newAddress];
        }
        return [...prev, newAddress];
      });

      // Close the modal FIRST, then reset form
      setShowAddModal(false);
      dispatch({ type: "RESET_FORM" });
      showSuccess("Address added successfully!");
    } catch (err) {
      console.error("Error adding address:", err);
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showError(err.response?.data?.message || "Failed to add address. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  }, [formState, getAuthToken, navigate, showError, showSuccess]);

  const updateAddress = useCallback(async (addressId, addressData) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setModalSubmitting(true);

      const response = await axios.put(
          `${apiURL}/users/me/addresses/${addressId}`,
          addressData,
          { headers: { Authorization: `Bearer ${token}` } }
      );

      const ok = response.data?.status === "OK" || response.status === 200;
      if (!ok) throw new Error("Update failed");

      const updated = response.data?.data ?? addressData;

      setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === addressId) return { ...a, ...updated };
            if (addressData.default) return { ...a, default: false };
            return a;
          })
      );

      setShowEditModal(false);
      setSelectedAddress(null);
      dispatch({ type: "RESET_FORM" });
      showSuccess("Address updated successfully!");
    } catch (err) {
      console.error("Error updating address:", err);
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showError("Failed to update address");
    } finally {
      setModalSubmitting(false);
    }
  }, [getAuthToken, navigate, showError, showSuccess]);

  const deleteAddress = useCallback(async (addressId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setModalSubmitting(true);

      const response = await axios.delete(`${apiURL}/users/me/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ok = response.data?.status === "OK" || response.status === 200 || response.status === 204;
      if (!ok) throw new Error("Delete failed");

      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      setShowDeleteModal(false);
      setSelectedAddress(null);
      showSuccess("Address deleted successfully!");
    } catch (err) {
      console.error("Error deleting address:", err);
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showError("Failed to delete address. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  }, [getAuthToken, navigate, showError, showSuccess]);

  const setDefaultAddress = useCallback(async (addressId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setAddressLoading(addressId, true);

      const response = await axios.put(
          `${apiURL}/users/me/addresses/${addressId}/default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
      );

      const ok = response.data?.status === "OK" || response.status === 200;
      if (!ok) throw new Error("Set default failed");

      // Update local state instead of full refetch
      setAddresses((prev) =>
          prev.map((a) => ({ ...a, default: a.id === addressId }))
      );
      showSuccess("Default address updated successfully!");
    } catch (err) {
      console.error("Error setting default address:", err);
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showError("Failed to set default address. Please try again.");
    } finally {
      setAddressLoading(addressId, false);
    }
  }, [getAuthToken, navigate, setAddressLoading, showError, showSuccess]);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/signin"); return; }
    fetchAddresses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = useCallback((field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  }, []);

  const handleAddSubmit = useCallback(async (e) => {
    e.preventDefault();
    await addAddress();
  }, [addAddress]);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formState.addressLine1.trim() || !formState.city.trim() ||
        !formState.country.trim() || !formState.postalCode.trim()) {
      showError("Please fill in all required fields");
      return;
    }
    if (!selectedAddress) { showError("No address selected for editing"); return; }

    await updateAddress(selectedAddress.id, {
      addressLine1: formState.addressLine1,
      addressLine2: formState.addressLine2,
      city: formState.city,
      country: formState.country,
      postalCode: formState.postalCode,
      addressType: formState.addressType,
      default: formState.default,
    });
  }, [formState, selectedAddress, updateAddress, showError]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAddress) { showError("No address selected for deletion"); return; }
    await deleteAddress(selectedAddress.id);
  }, [selectedAddress, deleteAddress, showError]);

  const openEditModal = useCallback((address) => {
    setSelectedAddress(address);
    dispatch({
      type: "SET_INITIAL_DATA",
      payload: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        addressType: address.addressType,
        default: address.default,
      },
    });
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((address) => {
    setSelectedAddress(address);
    setShowDeleteModal(true);
  }, []);

  const resetAndCloseAdd = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    setShowAddModal(false);
  }, []);

  const resetAndCloseEdit = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    setSelectedAddress(null);
    setShowEditModal(false);
  }, []);

  if (loading) {
    return (
        <>
          <Header />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto" />
              <p className="mt-4 text-gray-600">Loading addresses...</p>
            </div>
          </div>
          <Footer />
        </>
    );
  }

  if (error) {
    return (
        <>
          <Header />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchAddresses} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Retry
              </button>
            </div>
          </div>
          <Footer />
        </>
    );
  }

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.default && !b.default) return -1;
    if (!a.default && b.default) return 1;
    return 0;
  });

  return (
      <>
        <Header />

        {/* Success toast */}
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

        {/* Error toast */}
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

        <div className="min-h-screen bg-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Addresses</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage your delivery addresses</p>
                </div>
                {addresses.length < 6 && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 text-white py-2 px-4 sm:px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <i className="fa-solid fa-plus" />
                      <span>Add New Address</span>
                    </button>
                )}
              </div>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <i className="fa-solid fa-location-dot text-4xl sm:text-6xl text-gray-400 mb-4 sm:mb-6 block" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No addresses found</h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                    Add your first delivery address to get started
                  </p>
                  <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedAddresses.map((address) => (
                      <div
                          key={address.id}
                          className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 ${
                              address.default ? "border-green-500" : "border-transparent"
                          }`}
                      >
                        {address.default && (
                            <div className="mb-3 sm:mb-4">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <i className="fa-solid fa-star mr-1" />
                        Default Address
                      </span>
                            </div>
                        )}

                        <div className="mb-3 sm:mb-4">
                          <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">
                            {address.addressType
                                ? address.addressType.charAt(0) + address.addressType.slice(1).toLowerCase()
                                : "Address"}
                          </h3>
                          <div className="text-gray-700 text-xs sm:text-sm space-y-1">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.country}</p>
                            <p>{address.postalCode}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {!address.default && (
                              <button
                                  onClick={() => setDefaultAddress(address.id)}
                                  disabled={isAddressLoading(address.id)}
                                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                      isAddressLoading(address.id)
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  }`}
                              >
                                {isAddressLoading(address.id) ? "Setting..." : "Set Default"}
                              </button>
                          )}
                          <button
                              onClick={() => openEditModal(address)}
                              className="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => openDeleteModal(address)}
                              className="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            <div className="text-center mt-8">
              <Link
                  to="/profile"
                  className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <i className="fa-solid fa-arrow-left mr-2" />
                Back to Profile
              </Link>
            </div>
          </div>
        </div>

        {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Add New Address</h3>

                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formState.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {countries.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formState.addressType}
                        onChange={(e) => handleInputChange("addressType", e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {addressTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formState.addressLine1}
                        onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                        maxLength={20}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                        type="text"
                        value={formState.addressLine2}
                        onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                        maxLength={20}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formState.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        maxLength={30}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formState.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        maxLength={9}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter postal code"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="defaultAdd"
                        checked={formState.default}
                        onChange={(e) => handleInputChange("default", e.target.checked)}
                        className="w-4 h-4 text-green-600"
                    />
                    <label htmlFor="defaultAdd" className="text-sm text-gray-700">Set as default address</label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={resetAndCloseAdd}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={modalSubmitting}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                            modalSubmitting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    >
                      {modalSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin" /> Adding...
                    </span>
                      ) : "Add Address"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* ── Edit Address Modal ────────────────────────────────────────── */}
        {showEditModal && selectedAddress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Edit Address</h3>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Type *</label>
                    <select
                        value={formState.addressType}
                        onChange={(e) => handleInputChange("addressType", e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {addressTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                    <input
                        type="text"
                        value={formState.addressLine1}
                        onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                        maxLength={30}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                        type="text"
                        value={formState.addressLine2}
                        onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                        maxLength={30}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                          type="text"
                          value={formState.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                          maxLength={30}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                      <select
                          value={formState.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {countries.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                    <input
                        type="text"
                        value={formState.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                        maxLength={9}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="defaultEdit"
                        checked={formState.default}
                        onChange={(e) => handleInputChange("default", e.target.checked)}
                        className="w-4 h-4 text-green-600"
                    />
                    <label htmlFor="defaultEdit" className="text-sm text-gray-700">Set as default address</label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={resetAndCloseEdit}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={modalSubmitting}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                            modalSubmitting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      {modalSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin" /> Updating...
                    </span>
                      ) : "Update Address"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
        {showDeleteModal && selectedAddress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <i className="fa-solid fa-trash text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Address</h3>
                  <p className="text-gray-600 mb-4">Are you sure you want to delete this address?</p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
                    <p className="text-sm text-gray-700">{selectedAddress.addressLine1}</p>
                    {selectedAddress.addressLine2 && <p className="text-sm text-gray-700">{selectedAddress.addressLine2}</p>}
                    <p className="text-sm text-gray-700">{selectedAddress.city}, {selectedAddress.country}</p>
                    <p className="text-sm text-gray-700">{selectedAddress.postalCode}</p>
                  </div>
                  <p className="text-red-600 text-sm mb-6">This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                        onClick={() => { setShowDeleteModal(false); setSelectedAddress(null); }}
                        disabled={modalSubmitting}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={modalSubmitting}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            modalSubmitting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                    >
                      {modalSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin" /> Deleting...
                    </span>
                      ) : "Delete"}
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

export default Addresses;