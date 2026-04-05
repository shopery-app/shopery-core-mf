import React, { useEffect, useReducer, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../../utils/auth";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import AddressModal from "../Modals/AddressModal";
import { injectAddressStyles } from "../Modals/addressStyles";

/* ── Reducer ────────────────────────────────────────────────────── */
const initialState = {
  addressLine1: "", addressLine2: "", city: "",
  country: "", postalCode: "", addressType: "", default: false,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return {
        addressLine1: action.payload.addressLine1 || "",
        addressLine2: action.payload.addressLine2 || "",
        city:         action.payload.city         || "",
        country:      action.payload.country      || "",
        postalCode:   action.payload.postalCode   || "",
        addressType:  action.payload.addressType  || "",
        default:      action.payload.default      || false,
      };
    case "RESET_FORM": return initialState;
    default:           return state;
  }
};

/* ── Component ──────────────────────────────────────────────────── */
const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [, ] = useReducer(formReducer, initialState);
  const [loadingStates, setLoadingStates]   = useState({});
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { injectAddressStyles(); }, []);

  /* helpers */
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const setAddressLoading = useCallback((id, val) =>
      setLoadingStates((p) => ({ ...p, [id]: val })), []);

  const isAddressLoading = useCallback((id) =>
      loadingStates[id] || false, [loadingStates]);

  const getToken = useCallback(() => {
    const t = localStorage.getItem("accessToken");
    if (!t) { navigate("/signin"); return null; }
    return t;
  }, [navigate]);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
  }), [getToken]);

  /* ── Fetch ── */
  const fetchAddresses = useCallback(async () => {
    const token = getToken(); if (!token) return;
    try {
      setLoading(true); setError(null);
      const res  = await axios.get(`${apiURL}/users/me/addresses`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data?.data ?? res.data;
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else setError("Failed to fetch addresses");
    } finally { setLoading(false); }
  }, [getToken, navigate]);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/signin"); return; }
    fetchAddresses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Add ── */
  const handleAddSubmit = useCallback(async (formData) => {
    const token = getToken(); if (!token) return;
    try {
      setModalSubmitting(true);
      const res = await axios.post(`${apiURL}/users/me/addresses`, formData, { headers: authHeaders() });
      const ok  = res.data?.status === "OK" || res.status === 200 || res.status === 201;
      if (!ok) throw new Error("Unexpected response");
      const newAddr = res.data?.data ?? res.data;

      // If user checked "set as default", call the dedicated endpoint right after
      if (formData.default && newAddr?.id) {
        await axios.put(`${apiURL}/users/me/addresses/${newAddr.id}/default`, {}, { headers: authHeaders() });
        setAddresses((prev) => [...prev.map((a) => ({ ...a, default: false })), { ...newAddr, default: true }]);
      } else {
        setAddresses((prev) => [...prev, newAddr]);
      }

      setModalMode(null);
      showToast("success", "Address added successfully!");
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showToast("error", err.response?.data?.message || "Failed to add address.");
    } finally { setModalSubmitting(false); }
  }, [getToken, authHeaders, navigate, showToast]);

  /* ── Edit ── */
  const handleEditSubmit = useCallback(async (formData) => {
    if (!selectedAddress) return;
    const token = getToken(); if (!token) return;
    try {
      setModalSubmitting(true);
      const res = await axios.put(`${apiURL}/users/me/addresses/${selectedAddress.id}`, formData, { headers: authHeaders() });
      const ok  = res.data?.status === "OK" || res.status === 200;
      if (!ok) throw new Error("Update failed");
      const updated = res.data?.data ?? formData;
      setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === selectedAddress.id) return { ...a, ...updated };
            if (formData.default) return { ...a, default: false };
            return a;
          })
      );
      setModalMode(null); setSelectedAddress(null);
      showToast("success", "Address updated successfully!");
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showToast("error", "Failed to update address.");
    } finally { setModalSubmitting(false); }
  }, [selectedAddress, getToken, authHeaders, navigate, showToast]);

  /* ── Delete ── */
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAddress) return;
    const token = getToken(); if (!token) return;
    try {
      setModalSubmitting(true);
      const res = await axios.delete(`${apiURL}/users/me/addresses/${selectedAddress.id}`, { headers: authHeaders() });
      const ok  = res.data?.status === "OK" || res.status === 200 || res.status === 204;
      if (!ok) throw new Error("Delete failed");
      setAddresses((prev) => prev.filter((a) => a.id !== selectedAddress.id));
      setModalMode(null); setSelectedAddress(null);
      showToast("success", "Address deleted successfully!");
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showToast("error", "Failed to delete address.");
    } finally { setModalSubmitting(false); }
  }, [selectedAddress, getToken, authHeaders, navigate, showToast]);

  /* ── Set default ── */
  const setDefaultAddress = useCallback(async (id) => {
    const token = getToken(); if (!token) return;
    try {
      setAddressLoading(id, true);
      const res = await axios.put(`${apiURL}/users/me/addresses/${id}/default`, {}, { headers: authHeaders() });
      const ok  = res.data?.status === "OK" || res.status === 200;
      if (!ok) throw new Error("Set default failed");
      setAddresses((prev) => prev.map((a) => ({ ...a, default: a.id === id })));
      showToast("success", "Default address updated!");
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate("/signin"); }
      else showToast("error", "Failed to set default address.");
    } finally { setAddressLoading(id, false); }
  }, [getToken, authHeaders, navigate, setAddressLoading, showToast]);

  /* ── Modal helpers ── */
  const openAdd    = () => { setSelectedAddress(null); setModalMode("add"); };
  const openEdit   = (a) => { setSelectedAddress(a); setModalMode("edit"); };
  const openDelete = (a) => { setSelectedAddress(a); setModalMode("delete"); };
  const closeModal = () => { setModalMode(null); setSelectedAddress(null); };

  /* ── Sorted list ── */
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.default && !b.default) return -1;
    if (!a.default && b.default) return  1;
    return 0;
  });

  /* ── Loading state ── */
  if (loading) return (
      <>
        <Header />
        <div className="addr-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div className="addr-spinner" />
        </div>
        <Footer />
      </>
  );

  /* ── Error state ── */
  if (error) return (
      <>
        <Header />
        <div className="addr-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#C0392B", marginBottom: 16 }}>{error}</p>
            <button onClick={fetchAddresses} className="addr-new-btn">Retry</button>
          </div>
        </div>
        <Footer />
      </>
  );

  /* ── Main render ── */
  return (
      <div className="addr-root">
        <Header />

        {/* Toast */}
        {toast && (
            <div className={`addr-toast ${toast.type}`}>
              <span className="addr-toast-dot" />
              {toast.msg}
            </div>
        )}

        <main style={{ maxWidth: 1140, margin: "0 auto", padding: "104px 24px 80px", minHeight: "82vh" }}>

          {/* Page title */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A09B96", margin: "0 0 7px" }}>
              Account
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, color: "#1A1714", margin: 0, letterSpacing: "-0.015em", lineHeight: 1.18 }}>
                My Addresses
              </h1>
              {addresses.length < 6 && (
                  <button className="addr-new-btn" onClick={openAdd}>
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                    Add Address
                  </button>
              )}
            </div>
          </div>

          {/* Content */}
          {sortedAddresses.length === 0 ? (
              <div className="addr-card" style={{ padding: "64px 24px", textAlign: "center" }}>
                <div className="addr-empty-icon"><i className="fa-solid fa-location-dot" /></div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, color: "#1A1714", margin: "0 0 6px" }}>
                  No addresses yet
                </h3>
                <p style={{ fontSize: 13, color: "#A09B96", margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif" }}>
                  Add your first delivery address to get started.
                </p>
                <button className="addr-new-btn" onClick={openAdd}>
                  <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                  Add Address
                </button>
              </div>
          ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {sortedAddresses.map((address) => (
                    <div key={address.id} className={`addr-item${address.default ? " is-default" : ""}`}>

                      {/* Default badge */}
                      {address.default && (
                          <div className="addr-default-badge">
                            <span className="addr-default-badge-dot" />
                            Default Address
                          </div>
                      )}

                      {/* Address type label */}
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1714", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                        {address.addressType
                            ? address.addressType.charAt(0) + address.addressType.slice(1).toLowerCase()
                            : "Address"}
                      </p>

                      {/* Address lines */}
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B6660", lineHeight: 1.7, marginBottom: 16 }}>
                        <p style={{ margin: 0 }}>{address.addressLine1}</p>
                        {address.addressLine2 && <p style={{ margin: 0 }}>{address.addressLine2}</p>}
                        <p style={{ margin: 0 }}>{address.city}, {address.country}</p>
                        <p style={{ margin: 0 }}>{address.postalCode}</p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8 }}>
                        {!address.default && (
                            <button
                                className="addr-item-btn default-btn"
                                onClick={() => setDefaultAddress(address.id)}
                                disabled={isAddressLoading(address.id)}
                            >
                              <i className="fa-solid fa-star" style={{ fontSize: 11 }} />
                              {isAddressLoading(address.id) ? "Setting…" : "Set Default"}
                            </button>
                        )}
                        <button className="addr-item-btn edit-btn" onClick={() => openEdit(address)}>
                          <i className="fa-solid fa-pen-to-square" style={{ fontSize: 11 }} />
                          Edit
                        </button>
                        <button className="addr-item-btn delete-btn" onClick={() => openDelete(address)}>
                          <i className="fa-solid fa-trash-can" style={{ fontSize: 11 }} />
                          Delete
                        </button>
                      </div>

                    </div>
                ))}
              </div>
          )}

          {/* Back link */}
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <Link
                to="/profile"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#A09B96", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "color 0.14s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#1A1714"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#A09B96"}
            >
              <i className="fa-solid fa-arrow-left" />
              Back to Profile
            </Link>
          </div>

        </main>

        {/* Unified modal — handles add / edit / delete */}
        <AddressModal
            isOpen={modalMode !== null}
            mode={modalMode || "add"}
            onClose={closeModal}
            onSubmit={modalMode === "edit" ? handleEditSubmit : handleAddSubmit}
            onConfirm={handleDeleteConfirm}
            initialData={selectedAddress}
            loading={modalSubmitting}
        />

        <Footer />
      </div>
  );
};

export default Addresses;