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
            const res = await axios.get(`${apiURL}/users/me/blogs/like`, {
                headers: authHeaders(token),
            });
            setBlogs(res?.data?.data?.content || []);
        } catch (e) {
            console.error("fetchLiked error:", e);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchLiked();
    }, [fetchLiked]);

    const handleUnlike = async (e, id) => {
        e.stopPropagation();
        const token = localStorage.getItem("accessToken");
        if (!token) return navigate("/signin");

        const prev = blogs;
        setBlogs((curr) => curr.filter((b) => b.id !== id));

        try {
            await axios.post(
                `${apiURL}/users/me/blogs/${id}/like`,
                {},
                { headers: authHeaders(token) }
            );
        } catch (e) {
            console.error("handleUnlike error:", e);
            setBlogs(prev);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="bg-rose-600 pt-32 pb-24 text-center px-6">
                <h1 className="text-4xl md:text-5xl font-black text-white italic">
                    Your Favorites
                </h1>
                <p className="text-rose-100 mt-2 text-sm font-medium">
                    Every story that moved you, saved in one place.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-10">
                <div className="flex mb-6">
                    <button
                        onClick={() => navigate("/blogs")}
                        className="flex items-center gap-2 px-6 py-3 bg-white shadow-sm border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <i className="fa-solid fa-arrow-left"></i> BACK TO FEED
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-rose-600 mx-auto"></div>
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {blogs.map((blog) => (
                            <div
                                key={blog.id}
                                onClick={() => navigate(`/blogs/${blog.id}`)}
                                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className="h-44 overflow-hidden rounded-xl mb-4 bg-slate-100">
                                    {blog.imageUrl ? (
                                        <img
                                            src={blog.imageUrl}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                            alt={blog.blogTitle}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">
                                    {blog.blogTitle}
                                </h3>

                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {blog.content}
                                </p>

                                <button
                                    onClick={(e) => handleUnlike(e, blog.id)}
                                    className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all"
                                >
                                    <i className="fa-solid fa-heart-crack"></i> UNLIKE STORY
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center">
                        <i className="fa-solid fa-heart text-slate-100 text-8xl mb-4"></i>
                        <h2 className="text-2xl font-bold text-slate-900">
                            No favorite stories yet
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Start exploring the feed and heart stories you enjoy.
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
});

export default LikedBlogs;