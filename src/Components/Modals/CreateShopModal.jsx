import React, { useState, useEffect, memo } from "react";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const NotificationBanner = memo(({ type, message, onClose }) => (
    <div className="fixed top-4 right-4 z-[60] max-w-sm">
        <div className={`${type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
            <i className={`fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} text-xl`} />
            <p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                <i className="fa-solid fa-times" />
            </button>
        </div>
    </div>
));

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
        const token = localStorage.getItem("accessToken");
        axios
            .get(`${apiURL}/dropdowns/subscription-tiers`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            .then((res) => {
                const data = res.data?.data ?? res.data;
                setTiers(Array.isArray(data) ? data : []);
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                        <input
                            type="text"
                            name="shopName"
                            value={formData.shopName}
                            onChange={handleChange}
                            placeholder="Enter shop name"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.shopName ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe your shop"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Subscription Tier</label>
                        {tiersLoading ? (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <i className="fa-solid fa-spinner fa-spin mr-2" /> Loading plans...
                            </div>
                        ) : tiers.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                                <i className="fa-solid fa-exclamation-circle mr-2 text-yellow-500" /> No tiers available.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {tiers.map((tier) => (
                                    <div
                                        key={tier.name}
                                        onClick={() => handleTier(tier.name)}
                                        className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${formData.subscriptionTier === tier.name ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-gray-100 bg-gray-50 hover:border-emerald-200"}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.subscriptionTier === tier.name ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                                                {tier.name}
                                            </span>
                                            <div className="text-emerald-700 font-bold text-sm">${tier.price}</div>
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {tier.features?.map((feat, i) => (
                                                <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                                                    <i className="fa-solid fa-check text-emerald-500 mt-0.5" /> {feat}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.subscriptionTier && <p className="text-red-500 text-xs mt-2">{errors.subscriptionTier}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={submitting || tiersLoading} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
                            {submitting ? "Submitting..." : "Submit for Approval"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default CreateShopModal;