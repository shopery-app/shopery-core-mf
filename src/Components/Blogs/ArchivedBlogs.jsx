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
            const res = await axios.get(`${apiURL}/users/me/blogs/archive`, {
                headers: authHeaders(token),
            });
            setBlogs(res?.data?.data?.content || []);
        } catch (e) {
            console.error("fetchArchivedBlogs error:", e);
            setBlogs([]);
            showToast("Could not load archived blogs", "error");
        } finally {
            setLoading(false);
        }
    }, [token, navigate, showToast]);

    useEffect(() => {
        fetchArchivedBlogs();
    }, [fetchArchivedBlogs]);

    const handleUnarchive = async (id) => {
        const prevBlogs = blogs;
        setBlogs((curr) => curr.filter((b) => b.id !== id));

        try {
            await axios.post(
                `${apiURL}/users/me/blogs/${id}/archive`,
                {},
                { headers: authHeaders(token) }
            );
            showToast("Blog unarchived", "success");
        } catch (e) {
            console.error("handleUnarchive error:", e);
            setBlogs(prevBlogs);
            showToast("Could not unarchive blog", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-12 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 italic">ARCHIVED STORIES</h1>
                        <p className="text-slate-500 font-medium">Hidden stories you can restore anytime.</p>
                    </div>

                    <button
                        onClick={() => navigate("/blogs/me")}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50"
                    >
                        BACK TO MY BLOGS
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 text-center font-bold text-slate-300">LOADING ARCHIVED STORIES...</div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 mb-2">{blog.blogTitle}</h3>
                                <p className="text-slate-600 text-sm leading-6 line-clamp-4 mb-5">{blog.content}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUnarchive(blog.id)}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700"
                                    >
                                        UNARCHIVE
                                    </button>

                                    <button
                                        onClick={() => navigate(`/blogs/${blog.id}`)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200"
                                    >
                                        VIEW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900">No archived stories.</h2>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ArchivedBlogs;