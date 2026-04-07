import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const ArchivedBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const { showToast } = useToast();

    const fetchArchivedBlogs = useCallback(async () => {
        if (!token) return navigate("/signin");
        try {
            setLoading(true);
            const res = await axios.get(`${apiURL}/users/me/blogs/archive`, { headers: authHeaders(token) });
            setBlogs(res?.data?.data?.content || []);
        } catch (e) {
            setBlogs([]);
            showToast("Could not load archived stories", "error");
        } finally {
            setLoading(false);
        }
    }, [token, navigate, showToast]);

    useEffect(() => { fetchArchivedBlogs(); }, [fetchArchivedBlogs]);

    const handleUnarchive = async (id) => {
        const prev = blogs;
        setBlogs((c) => c.filter((b) => b.id !== id));
        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/archive`, {}, { headers: authHeaders(token) });
            showToast("Story restored", "success");
        } catch (e) {
            setBlogs(prev);
            showToast("Could not restore story", "error");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
            <Header />
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 32px 80px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", marginBottom: "48px", flexWrap: "wrap" }}>
                    <div>
                        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "48px", fontWeight: 400, color: "#1A1A18", margin: 0, lineHeight: 1.1 }}>
                            Archive
                        </h1>
                        <p style={{ fontSize: "15px", color: "#9B9B94", margin: "6px 0 0" }}>Hidden stories you can restore anytime</p>
                    </div>
                    <button
                        onClick={() => navigate("/blogs/me")}
                        style={{ padding: "10px 20px", background: "transparent", border: "1px solid #DEDAD4", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#4A4A44", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        MY WORKSHOP
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px", fontSize: "13px", fontWeight: 600, color: "#C4BFB4", letterSpacing: "0.08em" }}>
                        LOADING ARCHIVE...
                    </div>
                ) : blogs.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                        {blogs.map((blog) => (
                            <div key={blog.id} style={{ background: "#FFFFFF", border: "1px solid #ECEAE4", borderRadius: "16px", overflow: "hidden" }}>
                                {blog.imageUrl && (
                                    <div style={{ height: "160px", overflow: "hidden" }}>
                                        <img src={blog.imageUrl} alt={blog.blogTitle} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(30%)" }} />
                                    </div>
                                )}
                                <div style={{ padding: "20px" }}>
                                    <div style={{ display: "inline-block", padding: "3px 10px", background: "#F0EDE8", borderRadius: "6px", fontSize: "10px", fontWeight: 600, color: "#9B9B94", letterSpacing: "0.08em", marginBottom: "12px" }}>
                                        ARCHIVED
                                    </div>
                                    <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "19px", fontWeight: 400, color: "#1A1A18", margin: "0 0 10px", lineHeight: 1.3 }}>
                                        {blog.blogTitle}
                                    </h3>
                                    <p style={{ fontSize: "13.5px", color: "#6B6B65", lineHeight: 1.65, margin: "0 0 18px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                                        {blog.content}
                                    </p>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => handleUnarchive(blog.id)}
                                            style={{ flex: 1, padding: "10px", background: "#1A1A18", color: "#FAFAF8", border: "none", borderRadius: "8px", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif", transition: "background 0.15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#2C2C28"}
                                            onMouseLeave={e => e.currentTarget.style.background = "#1A1A18"}
                                        >
                                            RESTORE
                                        </button>
                                        <button
                                            onClick={() => navigate(`/blogs/${blog.id}`)}
                                            style={{ flex: 1, padding: "10px", background: "transparent", color: "#4A4A44", border: "1px solid #ECEAE4", borderRadius: "8px", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif", transition: "background 0.15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#F5F3EE"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            VIEW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "80px 40px", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #ECEAE4" }}>
                        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#2C2C28", margin: "0 0 8px" }}>Nothing archived</p>
                        <p style={{ fontSize: "14px", color: "#9B9B94", margin: 0 }}>Stories you archive will appear here.</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ArchivedBlogs;