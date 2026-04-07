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

    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });

    const [imageUrl, setImageUrl] = useState("");
    const [preview, setPreview] = useState("");

    const fetchMyBlog = useCallback(async () => {
        if (!token) return navigate("/signin");

        try {
            setLoading(true);
            const res = await axios.get(`${apiURL}/users/me/blogs/${blogId}`, {
                headers: authHeaders(token),
            });

            const blog = res?.data?.data;
            setFormData({
                title: blog?.blogTitle || "",
                content: blog?.content || "",
            });
            setImageUrl(blog?.imageUrl || "");
            setPreview(blog?.imageUrl || "");
        } catch (e) {
            console.error("fetchMyBlog error:", e);
            showToast("Could not load blog", "error");
            navigate("/blogs/me");
        } finally {
            setLoading(false);
        }
    }, [blogId, navigate, token, showToast]);

    useEffect(() => {
        fetchMyBlog();
    }, [fetchMyBlog]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.put(
                `${apiURL}/users/me/blogs/${blogId}`,
                {
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                },
                {
                    headers: authHeaders(token),
                }
            );

            showToast("Blog updated successfully", "success");
            navigate("/blogs/me");
        } catch (e) {
            console.error("handleUpdate error:", e);
            showToast(e?.response?.data?.message || "Could not update blog", "error");
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

            const res = await axios.post(
                `${apiURL}/users/me/blogs/${blogId}/image`,
                form,
                {
                    headers: {
                        ...authHeaders(token),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newUrl = res?.data?.data || localPreview;
            setImageUrl(newUrl);
            setPreview(newUrl);
            showToast("Image updated successfully", "success");
        } catch (e) {
            console.error("handleImageUpload error:", e);
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
        setImageUrl("");
        setPreview("");

        try {
            await axios.delete(`${apiURL}/users/me/blogs/${blogId}/image`, {
                headers: authHeaders(token),
            });
            showToast("Image removed", "success");
        } catch (e) {
            console.error("handleDeleteImage error:", e);
            setImageUrl(prevImageUrl);
            setPreview(prevPreview);
            showToast("Could not remove image", "error");
        } finally {
            setDeletingImage(false);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 italic">EDIT STORY</h1>
                        <p className="text-slate-500 font-medium">Update your title, content, or image.</p>
                    </div>

                    <button
                        onClick={() => navigate("/blogs/me")}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50"
                    >
                        BACK
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-5">
                    <div>
                        <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            maxLength={40}
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                            required
                        />
                        <div className="mt-1 text-right text-xs text-slate-400">{formData.title.length}/40</div>
                    </div>

                    <div>
                        <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
                        <textarea
                            rows="8"
                            maxLength={400}
                            value={formData.content}
                            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none"
                            required
                        />
                        <div className="mt-1 text-right text-xs text-slate-400">{formData.content.length}/400</div>
                    </div>

                    <div>
                        <label className="block mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cover image</label>

                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center relative">
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-48 w-full object-cover rounded-xl mb-4" />
                            ) : (
                                <div className="h-48 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 font-bold mb-4">
                                    NO IMAGE
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                            />

                            <p className="text-xs font-bold text-slate-400 uppercase">
                                {uploadingImage ? "Uploading..." : "Click to change image"}
                            </p>
                        </div>

                        {(imageUrl || preview) && (
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                disabled={deletingImage}
                                className="mt-3 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-60"
                            >
                                {deletingImage ? "REMOVING..." : "REMOVE IMAGE"}
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold disabled:opacity-60"
                    >
                        {saving ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditBlog;