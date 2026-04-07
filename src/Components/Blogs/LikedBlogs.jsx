import React, { useState, useEffect, useCallback, lazy, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const Header = lazy(() => import("../Header"));
const Footer = lazy(() => import("../Footer"));

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const LikedBlogs = memo(() => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLiked = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return navigate("/signin");
        try {
            setLoading(true);
            const res = await axios.get(`${apiURL}/users/me/blogs/like`, { headers: authHeaders(token) });
            setBlogs(res?.data?.data?.content || []);
        } catch (e) {
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchLiked(); }, [fetchLiked]);

    const handleUnlike = async (e, id) => {
        e.stopPropagation();
        const token = localStorage.getItem("accessToken");
        if (!token) return navigate("/signin");
        const prev = blogs;
        setBlogs((c) => c.filter((b) => b.id !== id));
        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: authHeaders(token) });
        } catch (e) {
            setBlogs(prev);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
            <Header />

            <div style={{ background: "#1A1A18", paddingTop: "120px", paddingBottom: "80px", textAlign: "center", marginBottom: "-40px" }}>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "48px", fontWeight: 400, color: "#FAFAF8", margin: "0 0 8px" }}>
                    Favorites
                </h1>
                <p style={{ fontSize: "15px", color: "#9B9B94", margin: 0 }}>
                    Every story that moved you, saved in one place
                </p>
            </div>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 80px" }}>
                <div style={{ marginBottom: "32px", paddingTop: "48px" }}>
                    <button
                        onClick={() => navigate("/blogs")}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#FFFFFF", border: "1px solid #ECEAE4", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#4A4A44", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F5F3EE"}
                        onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        BACK TO FEED
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "32px", height: "32px", border: "2px solid #ECEAE4", borderTopColor: "#1A1A18", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    </div>
                ) : blogs.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                        {blogs.map((blog) => (
                            <div
                                key={blog.id}
                                onClick={() => navigate(`/blogs/${blog.id}`)}
                                style={{ background: "#FFFFFF", border: "1px solid #ECEAE4", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <div style={{ height: "180px", background: "#F0EDE5", overflow: "hidden" }}>
                                    {blog.imageUrl ? (
                                        <img src={blog.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={blog.blogTitle} />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="22" height="18" rx="2.5" stroke="#C4BFB4" strokeWidth="1.5"/><circle cx="10" cy="11" r="2.5" stroke="#C4BFB4" strokeWidth="1.5"/><path d="M3 19l6-5 4.5 4.5 3.5-3 7.5 5" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: "18px 20px" }}>
                                    <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "19px", fontWeight: 400, color: "#1A1A18", margin: "0 0 8px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                                        {blog.blogTitle}
                                    </h3>
                                    <p style={{ fontSize: "13px", color: "#6B6B65", margin: "0 0 16px", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                        {blog.content}
                                    </p>
                                    <button
                                        onClick={(e) => handleUnlike(e, blog.id)}
                                        style={{ width: "100%", padding: "10px", background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "11.5px", fontWeight: 600, color: "#C0392B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif", transition: "all 0.15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#C0392B"; e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#C0392B"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#FFF5F5"; e.currentTarget.style.color = "#C0392B"; e.currentTarget.style.borderColor = "#FECACA"; }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M6.5 11S1 7.5 1 4a3 3 0 015.5-1.7A3 3 0 0112 4c0 3.5-5.5 7-5.5 7z"/></svg>
                                        UNLIKE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "80px 40px", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #ECEAE4" }}>
                        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#2C2C28", margin: "0 0 8px" }}>No favorites yet</p>
                        <p style={{ fontSize: "14px", color: "#9B9B94", margin: 0 }}>Like stories in the feed and they'll appear here.</p>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <Footer />
        </div>
    );
});

export default LikedBlogs;