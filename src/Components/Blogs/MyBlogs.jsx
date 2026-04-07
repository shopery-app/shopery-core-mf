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
            console.error("fetchMyBlogs error:", e);
            setBlogs([]);
            showToast("Could not load your blogs", "error");
        } finally {
            setLoading(false);
        }
    }, [token, navigate, showToast]);

    useEffect(() => {
        fetchMyBlogs();
    }, [fetchMyBlogs]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this story permanently?")) return;

        const prevBlogs = blogs;
        setBlogs((curr) => curr.filter((b) => b.id !== id));

        try {
            await axios.delete(`${apiURL}/users/me/blogs/${id}`, {
                headers: authHeaders(token),
            });
            showToast("Blog deleted", "success");
        } catch (e) {
            console.error("handleDelete error:", e);
            setBlogs(prevBlogs);
            showToast("Could not delete blog", "error");
        }
    };

    const handleArchive = async (id) => {
        if (!window.confirm("Archive this story?")) return;

        const prevBlogs = blogs;
        setBlogs((curr) => curr.filter((b) => b.id !== id));

        try {
            await axios.post(
                `${apiURL}/users/me/blogs/${id}/archive`,
                {},
                { headers: authHeaders(token) }
            );
            showToast("Blog archived", "success");
        } catch (e) {
            console.error("handleArchive error:", e);
            setBlogs(prevBlogs);
            showToast("Could not archive blog", "error");
        }
    };

    const handleLike = async (id) => {
        const wasLiked = likedIds.has(id);

        setLikedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        setBlogs((prev) =>
            prev.map((b) =>
                b.id === id
                    ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? -1 : 1)) }
                    : b
            )
        );

        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: authHeaders(token) });
        } catch (e) {
            console.error("handleLike error:", e);

            setLikedIds((prev) => {
                const next = new Set(prev);
                if (wasLiked) next.add(id);
                else next.delete(id);
                return next;
            });

            setBlogs((prev) =>
                prev.map((b) =>
                    b.id === id
                        ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? 1 : -1)) }
                        : b
                )
            );

            showToast("Could not update like", "error");
        }
    };

    const handleSave = async (id) => {
        const wasSaved = savedIds.has(id);

        setSavedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        try {
            await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, { headers: authHeaders(token) });
            showToast(wasSaved ? "Removed from reading list" : "Saved to reading list", "success");
        } catch (e) {
            console.error("handleSave error:", e);
            setSavedIds((prev) => {
                const next = new Set(prev);
                if (wasSaved) next.add(id);
                else next.delete(id);
                return next;
            });
            showToast("Could not update save", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-12 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 italic">MY WORKSHOP</h1>
                        <p className="text-slate-500 font-medium">Manage your published content.</p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => navigate("/blogs")}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50"
                        >
                            BACK TO FEED
                        </button>

                        <button
                            onClick={() => navigate("/blogs/archived")}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700"
                        >
                            ARCHIVED
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center font-bold text-slate-300">LOADING YOUR STORIES...</div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                blog={{
                                    ...blog,
                                    isLiked: likedIds.has(blog.id),
                                    isSaved: savedIds.has(blog.id),
                                }}
                                isOwner={true}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                onEdit={(id) => navigate(`/blogs/edit/${id}`)}
                                onLike={handleLike}
                                onSave={handleSave}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900">No stories yet.</h2>
                        <button
                            onClick={() => navigate("/blogs")}
                            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                        >
                            CREATE ONE IN FEED
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default MyBlogs;