import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) =>
    token ? { Authorization: `Bearer ${token}` } : {};

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
            const res = await axios.get(`${apiURL}/blogs/${blogId}`, {
                headers: authHeaders(token),
            });
            setBlog(res?.data?.data || null);
        } catch (e) {
            console.error("fetchDetail error:", e);
            setBlog(null);
        } finally {
            setLoading(false);
        }
    }, [blogId, token]);

    const fetchUserStates = useCallback(async () => {
        if (!token) {
            setIsLiked(false);
            setIsSaved(false);
            return;
        }

        try {
            const [likedRes, savedRes] = await Promise.all([
                axios.get(`${apiURL}/users/me/blogs/like`, {
                    headers: authHeaders(token),
                }),
                axios.get(`${apiURL}/users/me/blogs/save`, {
                    headers: authHeaders(token),
                }),
            ]);

            const likedIds = new Set((likedRes?.data?.data?.content || []).map((b) => b.id));
            const savedIds = new Set((savedRes?.data?.data?.content || []).map((b) => b.id));

            setIsLiked(likedIds.has(blogId));
            setIsSaved(savedIds.has(blogId));
        } catch (e) {
            console.error("fetchUserStates error:", e);
        }
    }, [blogId, token]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    useEffect(() => {
        fetchUserStates();
    }, [fetchUserStates]);

    const handleLike = async () => {
        if (!token) return navigate("/signin");

        const prevLiked = isLiked;
        setIsLiked(!prevLiked);
        setBlog((prev) =>
            prev
                ? {
                    ...prev,
                    likeCount: Math.max(0, (prev.likeCount || 0) + (prevLiked ? -1 : 1)),
                }
                : prev
        );

        try {
            await axios.post(
                `${apiURL}/users/me/blogs/${blogId}/like`,
                {},
                { headers: authHeaders(token) }
            );
        } catch (e) {
            console.error("handleLike error:", e);
            setIsLiked(prevLiked);
            setBlog((prev) =>
                prev
                    ? {
                        ...prev,
                        likeCount: Math.max(0, (prev.likeCount || 0) + (prevLiked ? 1 : -1)),
                    }
                    : prev
            );
            showToast("Could not update like", "error");
        }
    };

    const handleSave = async () => {
        if (!token) return navigate("/signin");

        const prevSaved = isSaved;
        setIsSaved(!prevSaved);

        try {
            await axios.post(
                `${apiURL}/users/me/blogs/${blogId}/save`,
                {},
                { headers: authHeaders(token) }
            );
            showToast(prevSaved ? "Removed from reading list" : "Saved to reading list", "success");
        } catch (e) {
            console.error("handleSave error:", e);
            setIsSaved(prevSaved);
            showToast("Could not update saved state", "error");
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING...</div>;
    }

    if (!blog) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                Story not found.
                <button onClick={() => navigate("/blogs")}>Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 text-slate-400 font-bold text-[10px] tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors uppercase"
                >
                    <i className="fa-solid fa-arrow-left"></i> Go Back
                </button>

                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                    {blog.blogTitle}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-6 mb-12 py-6 border-y border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                            {blog.author?.profilePhotoUrl ? (
                                <img src={blog.author.profilePhotoUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-lg">
                                    {blog.author?.name?.charAt(0) || "?"}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Written By</p>
                            <h4 className="font-bold text-slate-900 text-lg leading-none">{blog.author?.name || "Unknown"}</h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                                isLiked ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            }`}
                        >
                            <i className={`${isLiked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
                            {blog.likeCount || 0}
                        </button>

                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                                isSaved ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <i className={`${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark`}></i>
                            {isSaved ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>

                {blog.imageUrl && (
                    <div className="mb-14">
                        <img src={blog.imageUrl} className="w-full rounded-[2rem] shadow-xl" alt={blog.blogTitle} />
                    </div>
                )}

                <div className="max-w-3xl mx-auto">
                    <p className="text-slate-800 leading-[2] text-xl whitespace-pre-line font-serif">
                        {blog.content}
                    </p>
                    <div className="mt-12 pt-12 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-sm italic">
                            Published on {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "-"}
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default BlogDetails;