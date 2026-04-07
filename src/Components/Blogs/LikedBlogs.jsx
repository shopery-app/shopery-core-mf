import React, { useState, useEffect, useCallback, lazy, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import BlogCard from "./BlogCard";

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
            const res = await axios.get(`${apiURL}/users/me/blogs/like`, {
                headers: authHeaders(token),
            });
            setBlogs(res?.data?.data?.content || []);
        } catch (e) {
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchLiked();
    }, [fetchLiked]);

    const handleUnlike = async (id) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return navigate("/signin");

        const prev = blogs;
        setBlogs((current) => current.filter((blog) => blog.id !== id));

        try {
            await axios.post(
                `${apiURL}/users/me/blogs/${id}/like`,
                {},
                { headers: authHeaders(token) }
            );
        } catch (e) {
            setBlogs(prev);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#FAFAF8",
                fontFamily: "'Instrument Sans', sans-serif",
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap"
                rel="stylesheet"
            />
            <Header />

            <div
                style={{
                    background: "#1A1A18",
                    paddingTop: "120px",
                    paddingBottom: "80px",
                    textAlign: "center",
                    marginBottom: "-40px",
                }}
            >
                <h1
                    style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: "48px",
                        fontWeight: 400,
                        color: "#FAFAF8",
                        margin: "0 0 8px",
                    }}
                >
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
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            background: "#FFFFFF",
                            border: "1px solid #ECEAE4",
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#4A4A44",
                            cursor: "pointer",
                            letterSpacing: "0.04em",
                            fontFamily: "'Instrument Sans', sans-serif",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F3EE")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M8 2L4 6l4 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        BACK TO FEED
                    </button>
                </div>

                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "80px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                border: "2px solid #ECEAE4",
                                borderTopColor: "#1A1A18",
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                    </div>
                ) : blogs.length > 0 ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                            gap: "24px",
                        }}
                    >
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                blog={{ ...blog, isLiked: true, isSaved: !!blog.isSaved }}
                                onLike={handleUnlike}
                                onSave={() => {}}
                                isOwner={false}
                                token={localStorage.getItem("accessToken")}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "80px 40px",
                            background: "#FFFFFF",
                            borderRadius: "20px",
                            border: "1px solid #ECEAE4",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: "24px",
                                color: "#2C2C28",
                                margin: "0 0 8px",
                            }}
                        >
                            No favorites yet
                        </p>
                        <p style={{ fontSize: "14px", color: "#9B9B94", margin: 0 }}>
                            Like stories in the feed and they'll appear here.
                        </p>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <Footer />
        </div>
    );
});

export default LikedBlogs;