import React, { useState, useEffect } from "react";
import { injectAddressStyles } from "./addressStyles";

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

const emptyForm = {
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    postalCode: "",
    addressType: "",
    default: false,
};

const AddressModal = ({ isOpen, mode = "add", onClose, onSubmit, onConfirm, initialData, loading }) => {
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors]     = useState({});

    useEffect(() => { injectAddressStyles(); }, []);

    useEffect(() => {
        if (!isOpen) return;
        if (initialData && (mode === "edit" || mode === "delete")) {
            setFormData({
                addressLine1: initialData.addressLine1 || "",
                addressLine2: initialData.addressLine2 || "",
                city:         initialData.city         || "",
                country:      initialData.country      || "",
                postalCode:   initialData.postalCode   || "",
                addressType:  initialData.addressType  || "",
                default:      initialData.default      || false,
            });
        } else {
            setFormData(emptyForm);
        }
        setErrors({});
    }, [isOpen, initialData, mode]);

    if (!isOpen) return null;

    const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

    const validate = () => {
        const e = {};
        if (!formData.addressLine1.trim()) e.addressLine1 = "Street address is required.";
        if (!formData.city.trim())         e.city         = "City is required.";
        if (!formData.country)             e.country      = "Please select a country.";
        if (!formData.postalCode.trim())   e.postalCode   = "Postal code is required.";
        if (!formData.addressType)         e.addressType  = "Please select an address type.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(formData);
    };

    const isEdit   = mode === "edit";
    const isDelete = mode === "delete";

    const badgeText = isDelete ? "Confirm action" : isEdit ? "Editing" : "New address";
    const titleText = isDelete ? "Delete Address" : isEdit ? "Edit Address" : "Add New Address";

    return (
        <div className="addr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="addr-modal-panel">

                {/* Header */}
                <div className="addr-modal-header">
                    <div>
                        <div className="addr-modal-badge">{badgeText}</div>
                        <h3 className="addr-modal-title">{titleText}</h3>
                    </div>
                    <button className="addr-modal-close" onClick={onClose} aria-label="Close">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* ── DELETE confirmation ── */}
                {isDelete && initialData && (
                    <div className="addr-modal-body" style={{ textAlign: "center" }}>
                        <div className="addr-delete-icon">
                            <i className="fa-solid fa-trash-can" />
                        </div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "#6B6660", margin: 0 }}>
                            Are you sure you want to delete this address? This cannot be undone.
                        </p>
                        <div className="addr-delete-preview">
                            <p>{initialData.addressLine1}</p>
                            {initialData.addressLine2 && <p>{initialData.addressLine2}</p>}
                            <p>{initialData.city}, {initialData.country}</p>
                            <p>{initialData.postalCode}</p>
                        </div>
                        <div className="addr-modal-footer">
                            <button type="button" className="addr-modal-btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={onConfirm}
                                className="addr-modal-btn-submit"
                                style={{ background: loading ? undefined : "#C0392B" }}
                            >
                                {loading ? (
                                    <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 12 }} /> Deleting…</>
                                ) : "Delete"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── ADD / EDIT form ── */}
                {!isDelete && (
                    <form onSubmit={handleSubmit} className="addr-modal-body">

                        {/* Country + Address Type */}
                        <div className="addr-modal-grid-2">
                            <div>
                                <label className="addr-modal-label">Country</label>
                                <select
                                    value={formData.country}
                                    onChange={(e) => set("country", e.target.value)}
                                    className={`addr-modal-select${errors.country ? " err" : ""}`}
                                >
                                    {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                {errors.country && <div className="addr-modal-err">{errors.country}</div>}
                            </div>
                            <div>
                                <label className="addr-modal-label">Type</label>
                                <select
                                    value={formData.addressType}
                                    onChange={(e) => set("addressType", e.target.value)}
                                    className={`addr-modal-select${errors.addressType ? " err" : ""}`}
                                >
                                    {addressTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                {errors.addressType && <div className="addr-modal-err">{errors.addressType}</div>}
                            </div>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className="addr-modal-label">Street Address</label>
                            <input
                                type="text"
                                value={formData.addressLine1}
                                onChange={(e) => set("addressLine1", e.target.value)}
                                maxLength={30}
                                placeholder="e.g. 123 Main Street"
                                className={`addr-modal-input${errors.addressLine1 ? " err" : ""}`}
                            />
                            {errors.addressLine1 && <div className="addr-modal-err">{errors.addressLine1}</div>}
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className="addr-modal-label">Address Line 2 <span style={{ color: "#C8C4BE", fontWeight: 400 }}>(optional)</span></label>
                            <input
                                type="text"
                                value={formData.addressLine2}
                                onChange={(e) => set("addressLine2", e.target.value)}
                                maxLength={30}
                                placeholder="Apartment, suite, floor…"
                                className="addr-modal-input"
                            />
                        </div>

                        {/* City + Postal Code */}
                        <div className="addr-modal-grid-2">
                            <div>
                                <label className="addr-modal-label">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => set("city", e.target.value)}
                                    maxLength={30}
                                    placeholder="e.g. Baku"
                                    className={`addr-modal-input${errors.city ? " err" : ""}`}
                                />
                                {errors.city && <div className="addr-modal-err">{errors.city}</div>}
                            </div>
                            <div>
                                <label className="addr-modal-label">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => set("postalCode", e.target.value)}
                                    maxLength={9}
                                    placeholder="e.g. AZ1000"
                                    className={`addr-modal-input${errors.postalCode ? " err" : ""}`}
                                />
                                {errors.postalCode && <div className="addr-modal-err">{errors.postalCode}</div>}
                            </div>
                        </div>

                        {/* Default checkbox */}
                        <label className="addr-modal-check-row">
                            <input
                                type="checkbox"
                                checked={formData.default}
                                onChange={(e) => set("default", e.target.checked)}
                            />
                            <span className="addr-modal-check-label">Set as default address</span>
                        </label>

                        {/* Footer */}
                        <div className="addr-modal-footer">
                            <button type="button" className="addr-modal-btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="addr-modal-btn-submit" disabled={loading}>
                                {loading ? (
                                    <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 12 }} /> {isEdit ? "Saving…" : "Adding…"}</>
                                ) : isEdit ? "Save Changes" : "Add Address"}
                            </button>
                        </div>

                    </form>
                )}

            </div>
        </div>
    );
};

export default AddressModal;