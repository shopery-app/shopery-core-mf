import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const EditBlog = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deletingImage, setDeletingImage] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [imageUrl, setImageUrl] = useState("");
    const [preview, setPreview] = useState("");

    const fetchMyBlog = useCallback(async () => {
        if (!token) return navigate("/signin");
        try {
            setLoading(true);
            const res = await axios.get(`${apiURL}/users/me/blogs/${blogId}`, { headers: authHeaders(token) });
            const blog = res?.data?.data;
            setFormData({ title: blog?.blogTitle || "", content: blog?.content || "" });
            setImageUrl(blog?.imageUrl || "");
            setPreview(blog?.imageUrl || "");
        } catch (e) {
            showToast("Could not load story", "error");
            navigate("/blogs/me");
        } finally {
            setLoading(false);
        }
    }, [blogId, navigate, token, showToast]);

    useEffect(() => { fetchMyBlog(); }, [fetchMyBlog]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${apiURL}/users/me/blogs/${blogId}`, { title: formData.title.trim(), content: formData.content.trim() }, { headers: authHeaders(token) });
            showToast("Story updated", "success");
            navigate("/blogs/me");
        } catch (e) {
            showToast(e?.response?.data?.message || "Could not update story", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        setUploadingImage(true);
        const localPreview = URL.createObjectURL(file);
        const prevPreview = preview;
        setPreview(localPreview);
        try {
            const form = new FormData();
            form.append("image", file);
            const res = await axios.post(`${apiURL}/users/me/blogs/${blogId}/image`, form, { headers: { ...authHeaders(token), "Content-Type": "multipart/form-data" } });
            const newUrl = res?.data?.data || localPreview;
            setImageUrl(newUrl);
            setPreview(newUrl);
            showToast("Image updated", "success");
        } catch (e) {
            setPreview(prevPreview);
            showToast("Could not upload image", "error");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!imageUrl && !preview) return;
        setDeletingImage(true);
        const prevImageUrl = imageUrl;
        const prevPreview = preview;
        setImageUrl(""); setPreview("");
        try {
            await axios.delete(`${apiURL}/users/me/blogs/${blogId}/image`, { headers: authHeaders(token) });
            showToast("Image removed", "success");
        } catch (e) {
            setImageUrl(prevImageUrl); setPreview(prevPreview);
            showToast("Could not remove image", "error");
        } finally {
            setDeletingImage(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8" }}>
                <div style={{ width: "36px", height: "36px", border: "2px solid #ECEAE4", borderTopColor: "#1A1A18", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const inputStyle = {
        width: "100%", padding: "14px 16px",
        background: "#FFFFFF", border: "1px solid #ECEAE4",
        borderRadius: "10px", outline: "none",
        fontSize: "14px", color: "#1A1A18",
        fontFamily: "'Instrument Sans', sans-serif",
        boxSizing: "border-box", transition: "border-color 0.15s",
    };

    const labelStyle = {
        display: "block", marginBottom: "8px",
        fontSize: "11px", fontWeight: 600,
        color: "#9B9B94", letterSpacing: "0.08em",
    };

    return (
        <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
            <Header />
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "120px 32px 80px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
                    <div>
                        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "40px", fontWeight: 400, color: "#1A1A18", margin: 0, lineHeight: 1.1 }}>
                            Edit Story
                        </h1>
                        <p style={{ fontSize: "14px", color: "#9B9B94", margin: "6px 0 0" }}>Update your title, content, or image</p>
                    </div>
                    <button
                        onClick={() => navigate("/blogs/me")}
                        style={{ padding: "10px 20px", background: "transparent", border: "1px solid #DEDAD4", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#4A4A44", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        CANCEL
                    </button>
                </div>

                <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <label style={labelStyle}>TITLE</label>
                        <input
                            type="text" maxLength={40} required
                            value={formData.title}
                            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                            style={{ ...inputStyle, fontWeight: 600, fontSize: "16px" }}
                            onFocus={e => e.currentTarget.style.borderColor = "#1A1A18"}
                            onBlur={e => e.currentTarget.style.borderColor = "#ECEAE4"}
                        />
                        <div style={{ textAlign: "right", fontSize: "11px", color: "#B0ADA5", marginTop: "5px" }}>{formData.title.length}/40</div>
                    </div>

                    <div>
                        <label style={labelStyle}>CONTENT</label>
                        <textarea
                            rows="10" maxLength={400} required
                            value={formData.content}
                            onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                            style={{ ...inputStyle, fontFamily: "'DM Serif Display', serif", fontSize: "16px", lineHeight: 1.8, resize: "none" }}
                            onFocus={e => e.currentTarget.style.borderColor = "#1A1A18"}
                            onBlur={e => e.currentTarget.style.borderColor = "#ECEAE4"}
                        />
                        <div style={{ textAlign: "right", fontSize: "11px", color: "#B0ADA5", marginTop: "5px" }}>{formData.content.length}/400</div>
                    </div>

                    <div>
                        <label style={labelStyle}>COVER IMAGE</label>
                        <div style={{ position: "relative", border: "1.5px dashed #DEDAD4", borderRadius: "12px", overflow: "hidden", background: "#FAFAF8" }}>
                            {preview ? (
                                <img src={preview} alt="Cover" style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                            ) : (
                                <div style={{ height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="22" height="18" rx="2.5" stroke="#C4BFB4" strokeWidth="1.5"/><circle cx="10" cy="11" r="2.5" stroke="#C4BFB4" strokeWidth="1.5"/><path d="M3 19l6-5 4.5 4.5 3.5-3 7.5 5" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#B0ADA5", margin: 0 }}>Click to add a cover image</p>
                                </div>
                            )}
                            <input
                                type="file" accept="image/*"
                                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                            />
                            {uploadingImage && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(250,250,248,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ width: "28px", height: "28px", border: "2px solid #ECEAE4", borderTopColor: "#1A1A18", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                </div>
                            )}
                        </div>
                        {(imageUrl || preview) && (
                            <button
                                type="button" onClick={handleDeleteImage} disabled={deletingImage}
                                style={{ marginTop: "10px", padding: "9px 16px", background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "11.5px", fontWeight: 600, color: "#C0392B", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif", opacity: deletingImage ? 0.6 : 1 }}
                            >
                                {deletingImage ? "REMOVING..." : "REMOVE IMAGE"}
                            </button>
                        )}
                    </div>

                    <button
                        type="submit" disabled={saving}
                        style={{ padding: "15px", background: saving ? "#8A8A84" : "#1A1A18", color: "#FAFAF8", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif", transition: "background 0.15s" }}
                    >
                        {saving ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                </form>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } ::placeholder { color: #C4BFB4; }`}</style>
            <Footer />
        </div>
    );
};

export default EditBlog;