import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import BlogCard from "./BlogCard";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const MyBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedIds, setLikedIds] = useState(new Set());
    const [savedIds, setSavedIds] = useState(new Set());

    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const { showToast } = useToast();

    const fetchMyBlogs = useCallback(async () => {
        if (!token) return navigate("/signin");
        try {
            setLoading(true);
            const [myBlogsRes, likedRes, savedRes] = await Promise.all([
                axios.get(`${apiURL}/users/me/blogs`, { headers: authHeaders(token) }),
                axios.get(`${apiURL}/users/me/blogs/like`, { headers: authHeaders(token) }),
                axios.get(`${apiURL}/users/me/blogs/save`, { headers: authHeaders(token) }),
            ]);
            setBlogs(myBlogsRes?.data?.data?.content || []);
            setLikedIds(new Set((likedRes?.data?.data?.content || []).map((b) => b.id)));
            setSavedIds(new Set((savedRes?.data?.data?.content || []).map((b) => b.id)));
        } catch (e) {
            setBlogs([]);
            showToast("Could not load your stories", "error");
        } finally {
            setLoading(false);
        }
    }, [token, navigate, showToast]);

    useEffect(() => { fetchMyBlogs(); }, [fetchMyBlogs]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this story permanently?")) return;
        const prev = blogs;
        setBlogs((c) => c.filter((b) => b.id !== id));
        try {
            await axios.delete(`${apiURL}/users/me/blogs/${id}`, { headers: authHeaders(token) });
            showToast("Story deleted", "success");
        } catch (e) {
            setBlogs(prev);
            showToast("Could not delete story", "error");
        }
    };

    const handleArchive = async (id) => {
        if (!window.confirm("Archive this story?")) return;
        const prev = blogs;
        setBlogs((c) => c.filter((b) => b.id !== id));
        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/archive`, {}, { headers: authHeaders(token) });
            showToast("Story archived", "success");
        } catch (e) {
            setBlogs(prev);
            showToast("Could not archive story", "error");
        }
    };

    const handleLike = async (id) => {
        const wasLiked = likedIds.has(id);
        setLikedIds((p) => { const n = new Set(p); wasLiked ? n.delete(id) : n.add(id); return n; });
        setBlogs((p) => p.map((b) => b.id === id ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? -1 : 1)) } : b));
        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: authHeaders(token) });
        } catch (e) {
            setLikedIds((p) => { const n = new Set(p); wasLiked ? n.add(id) : n.delete(id); return n; });
            setBlogs((p) => p.map((b) => b.id === id ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? 1 : -1)) } : b));
            showToast("Could not update like", "error");
        }
    };

    const handleSave = async (id) => {
        const wasSaved = savedIds.has(id);
        setSavedIds((p) => { const n = new Set(p); wasSaved ? n.delete(id) : n.add(id); return n; });
        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, { headers: authHeaders(token) });
            showToast(wasSaved ? "Removed from reading list" : "Saved to reading list", "success");
        } catch (e) {
            setSavedIds((p) => { const n = new Set(p); wasSaved ? n.add(id) : n.delete(id); return n; });
            showToast("Could not update save", "error");
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
                            My Workshop
                        </h1>
                        <p style={{ fontSize: "15px", color: "#9B9B94", margin: "6px 0 0" }}>Manage your published content</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => navigate("/blogs")}
                            style={{ padding: "10px 20px", background: "transparent", border: "1px solid #DEDAD4", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#4A4A44", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            FEED
                        </button>
                        <button
                            onClick={() => navigate("/blogs/archived")}
                            style={{ padding: "10px 20px", background: "#F5F3FF", border: "1px solid #DDD8F0", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#5B52A3", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#ECEAFF"}
                            onMouseLeave={e => e.currentTarget.style.background = "#F5F3FF"}
                        >
                            ARCHIVED
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px", fontSize: "13px", fontWeight: 600, color: "#C4BFB4", letterSpacing: "0.08em" }}>
                        LOADING YOUR STORIES...
                    </div>
                ) : blogs.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                blog={{ ...blog, isLiked: likedIds.has(blog.id), isSaved: savedIds.has(blog.id) }}
                                isOwner={true}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                onEdit={(id) => navigate(`/blogs/edit/${id}`)}
                                onLike={handleLike}
                                onSave={handleSave}
                                token={token}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "80px 40px", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #ECEAE4" }}>
                        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#2C2C28", margin: "0 0 8px" }}>No stories yet</p>
                        <p style={{ fontSize: "14px", color: "#9B9B94", margin: "0 0 24px" }}>Your workshop is empty. Head to the feed to write your first story.</p>
                        <button
                            onClick={() => navigate("/blogs")}
                            style={{ padding: "11px 28px", background: "#1A1A18", color: "#FAFAF8", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Instrument Sans', sans-serif" }}
                        >
                            GO TO FEED
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyBlogs;