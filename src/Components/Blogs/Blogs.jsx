import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import BlogCard from "./BlogCard";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) =>
    token ? { Authorization: `Bearer ${token}` } : {};

const getPageContent = (res) => res?.data?.data?.content || [];
const getSingleData = (res) => res?.data?.data || null;

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", image: null });
  const [preview, setPreview] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const { showToast } = useToast();

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const fetchBlogs = useCallback(
      async (query = "") => {
        try {
          setLoading(true);
          const res = await axios.get(`${apiURL}/blogs`, {
            params: query ? { blogTitle: query } : {},
            headers: authHeaders(token),
          });
          setBlogs(getPageContent(res));
        } catch (error) {
          console.error("fetchBlogs error:", error);
          setBlogs([]);
        } finally {
          setLoading(false);
        }
      },
      [token]
  );

  const fetchUserStates = useCallback(async () => {
    if (!token) {
      setLikedIds(new Set());
      setSavedIds(new Set());
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

      const liked = getPageContent(likedRes).map((b) => b.id);
      const saved = getPageContent(savedRes).map((b) => b.id);

      setLikedIds(new Set(liked));
      setSavedIds(new Set(saved));
    } catch (e) {
      console.error("fetchUserStates error:", e);
    }
  }, [token]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchUserStates();
  }, [fetchUserStates]);

  const handleLike = async (id) => {
    if (!token) return navigate("/signin");

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
                ? {
                  ...b,
                  likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? -1 : 1)),
                }
                : b
        )
    );

    try {
      await axios.post(
          `${apiURL}/users/me/blogs/${id}/like`,
          {},
          { headers: authHeaders(token) }
      );
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
                  ? {
                    ...b,
                    likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? 1 : -1)),
                  }
                  : b
          )
      );
    }
  };

  const handleSave = async (id) => {
    if (!token) return navigate("/signin");

    const wasSaved = savedIds.has(id);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, {
        headers: authHeaders(token),
      });
      showToast(wasSaved ? "Removed from reading list" : "Story saved to your reading list!", "success");
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

  const openCreateModal = () => {
    if (!token) return navigate("/signin");
    setShowModal(true);
  };

  const resetCreateForm = () => {
    setShowModal(false);
    setFormData({ title: "", content: "", image: null });
    setPreview(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!token) return navigate("/signin");
    if (!formData.title.trim() || !formData.content.trim()) return;

    setCreating(true);

    try {
      const res = await axios.post(
          `${apiURL}/users/me/blogs`,
          {
            title: formData.title.trim(),
            content: formData.content.trim(),
          },
          {
            headers: authHeaders(token),
          }
      );

      const createdBlog = getSingleData(res);

      if (formData.image && createdBlog?.id) {
        const imgData = new FormData();
        imgData.append("image", formData.image);

        await axios.post(
            `${apiURL}/users/me/blogs/${createdBlog.id}/image`,
            imgData,
            {
              headers: {
                ...authHeaders(token),
                "Content-Type": "multipart/form-data",
              },
            }
        );
      }

      resetCreateForm();
      await fetchBlogs(searchTerm);
      await fetchUserStates();
    } catch (err) {
      console.error("handleCreate error:", err);
      showToast(err?.response?.data?.message || "Blog could not be created. Check title/content length and image upload.", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
                THE FEED
              </h1>
              <p className="text-slate-500 font-medium">
                Discover stories from the community.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                  onClick={() => (token ? navigate("/blogs/me") : navigate("/signin"))}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:border-emerald-500 transition-all"
              >
                MY STORIES
              </button>

              <button
                  onClick={() => (token ? navigate("/blogs/liked") : navigate("/signin"))}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:border-rose-500 transition-all"
              >
                LIKED
              </button>

              <button
                  onClick={() => (token ? navigate("/blogs/saved") : navigate("/signin"))}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:border-indigo-500 transition-all"
              >
                SAVED
              </button>

              <button
                  onClick={openCreateModal}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
              >
                CREATE POST
              </button>
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl flex gap-2 mb-12 shadow-sm border border-slate-200">
            <input
                className="flex-1 px-4 py-3 outline-none font-medium text-slate-700"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchBlogs(searchTerm.trim());
                }}
            />
            <button
                onClick={() => fetchBlogs(searchTerm.trim())}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase"
            >
              Search
            </button>
          </div>

          {loading ? (
              <div className="py-20 text-center text-slate-400 font-bold animate-pulse">
                LOADING STORIES...
              </div>
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
                        onLike={handleLike}
                        onSave={handleSave}
                        isOwner={false}
                    />
                ))}
              </div>
          ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900">No stories found.</h2>
                <p className="text-slate-500 mt-2">
                  Try another title or create the first one.
                </p>
              </div>
          )}
        </div>

        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
                <button
                    onClick={resetCreateForm}
                    className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"
                    type="button"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <h2 className="text-3xl font-black mb-6 italic">Publish Story</h2>

                <form onSubmit={handleCreate} className="space-y-4">
                  <input
                      type="text"
                      placeholder="Title"
                      required
                      maxLength={40}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                      value={formData.title}
                      onChange={(e) =>
                          setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                  />

                  <textarea
                      placeholder="Content"
                      required
                      rows="5"
                      maxLength={400}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none"
                      value={formData.content}
                      onChange={(e) =>
                          setFormData((prev) => ({ ...prev, content: e.target.value }))
                      }
                  />

                  <div className="text-xs text-slate-400 flex justify-between px-1">
                    <span>Title max 40</span>
                    <span>Content max 400</span>
                  </div>

                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    {preview ? (
                        <img
                            src={preview}
                            className="h-32 rounded-xl object-cover mx-auto"
                            alt="Preview"
                        />
                    ) : (
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Click to add cover image
                        </p>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setFormData((prev) => ({ ...prev, image: f }));
                            setPreview(URL.createObjectURL(f));
                          }
                        }}
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={creating}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold disabled:opacity-60"
                  >
                    {creating ? "PUBLISHING..." : "PUBLISH"}
                  </button>
                </form>
              </div>
            </div>
        )}

        <Footer />
      </div>
  );
};

export default Blogs;