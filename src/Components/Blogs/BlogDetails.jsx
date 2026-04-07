import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};

const BlogDetails = () => {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const { showToast } = useToast();

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${apiURL}/blogs/${blogId}`, { headers: authHeaders(token) });
            setBlog(res?.data?.data || null);
        } catch (e) {
            setBlog(null);
        } finally {
            setLoading(false);
        }
    }, [blogId, token]);

    const fetchUserStates = useCallback(async () => {
        if (!token) { setIsLiked(false); setIsSaved(false); return; }
        try {
            const [likedRes, savedRes] = await Promise.all([
                axios.get(`${apiURL}/users/me/blogs/like`, { headers: authHeaders(token) }),
                axios.get(`${apiURL}/users/me/blogs/save`, { headers: authHeaders(token) }),
            ]);
            const likedIds = new Set((likedRes?.data?.data?.content || []).map((b) => b.id));
            const savedIds = new Set((savedRes?.data?.data?.content || []).map((b) => b.id));
            setIsLiked(likedIds.has(blogId));
            setIsSaved(savedIds.has(blogId));
        } catch (e) { console.error(e); }
    }, [blogId, token]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);
    useEffect(() => { fetchUserStates(); }, [fetchUserStates]);

    const handleLike = async () => {
        if (!token) return navigate("/signin");
        const prev = isLiked;
        setIsLiked(!prev);
        setBlog((b) => b ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (prev ? -1 : 1)) } : b);
        try {
            await axios.post(`${apiURL}/users/me/blogs/${blogId}/like`, {}, { headers: authHeaders(token) });
        } catch (e) {
            setIsLiked(prev);
            setBlog((b) => b ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (prev ? 1 : -1)) } : b);
            showToast("Could not update like", "error");
        }
    };

    const handleSave = async () => {
        if (!token) return navigate("/signin");
        const prev = isSaved;
        setIsSaved(!prev);
        try {
            await axios.post(`${apiURL}/users/me/blogs/${blogId}/save`, {}, { headers: authHeaders(token) });
            showToast(prev ? "Removed from reading list" : "Saved to reading list", "success");
        } catch (e) {
            setIsSaved(prev);
            showToast("Could not update saved state", "error");
        }
    };

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" }}>
                <div style={{ width: "36px", height: "36px", border: "2px solid #ECEAE4", borderTopColor: "#1A1A18", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!blog) {
        return (
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" }}>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#2C2C28", marginBottom: "16px" }}>Story not found</p>
                <button onClick={() => navigate("/blogs")} style={{ padding: "10px 24px", background: "#1A1A18", color: "#FAFAF8", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif" }}>
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
            <Header />

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "120px 32px 80px" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#9B9B94", letterSpacing: "0.05em", marginBottom: "40px", padding: 0, fontFamily: "'Instrument Sans', sans-serif", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#1A1A18"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9B9B94"}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    GO BACK
                </button>

                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 400, color: "#1A1A18", margin: "0 0 32px", lineHeight: 1.15 }}>
                    {blog.blogTitle}
                </h1>

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px", marginBottom: "40px", padding: "20px 0", borderTop: "1px solid #ECEAE4", borderBottom: "1px solid #ECEAE4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", background: "#E8E5DE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {blog.author?.profilePhotoUrl ? (
                                <img src={blog.author.profilePhotoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            ) : (
                                <span style={{ fontSize: "16px", fontWeight: 600, color: "#6B5A3E" }}>
                                    {blog.author?.name?.charAt(0) || "?"}
                                </span>
                            )}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1A1A18" }}>{blog.author?.name || "Anonymous"}</p>
                            <p style={{ margin: 0, fontSize: "12px", color: "#9B9B94" }}>
                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={handleLike}
                            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "22px", border: "1px solid", borderColor: isLiked ? "#FECACA" : "#ECEAE4", background: isLiked ? "#FFF0F0" : "transparent", color: isLiked ? "#C0392B" : "#6B6B65", cursor: "pointer", fontSize: "13px", fontWeight: 500, fontFamily: "'Instrument Sans', sans-serif", transition: "all 0.15s" }}
                        >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                                <path d="M7.5 12.5S1.5 8.5 1.5 4.5a3 3 0 015.5-1.7A3 3 0 0113.5 4.5c0 4-6 8-6 8z" strokeLinejoin="round"/>
                            </svg>
                            {blog.likeCount || 0}
                        </button>

                        <button
                            onClick={handleSave}
                            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "22px", border: "1px solid", borderColor: isSaved ? "#D4C9B0" : "#ECEAE4", background: isSaved ? "#F5F0E8" : "transparent", color: isSaved ? "#6B5A3E" : "#6B6B65", cursor: "pointer", fontSize: "13px", fontWeight: 500, fontFamily: "'Instrument Sans', sans-serif", transition: "all 0.15s" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                                <path d="M2.5 2a1 1 0 011-1h7a1 1 0 011 1v10.5l-4.5-2.5-4.5 2.5V2z" strokeLinejoin="round"/>
                            </svg>
                            {isSaved ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>

                {blog.imageUrl && (
                    <div style={{ marginBottom: "48px", borderRadius: "16px", overflow: "hidden" }}>
                        <img src={blog.imageUrl} style={{ width: "100%", display: "block" }} alt={blog.blogTitle} />
                    </div>
                )}

                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "19px", fontWeight: 400, color: "#2C2C28", lineHeight: 1.9, whiteSpace: "pre-line", margin: 0 }}>
                    {blog.content}
                </p>

                <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid #ECEAE4", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: "#B0ADA5", margin: 0, letterSpacing: "0.05em" }}>
                        PUBLISHED {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase() : ""}
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BlogDetails;