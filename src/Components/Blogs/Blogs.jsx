import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import BlogCard from "./BlogCard";
import { useToast } from "../UI/ToastProvider";

const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};
const getPageContent = (res) => res?.data?.data?.content || [];
const getSingleData = (res) => res?.data?.data || null;

const S = {
  page: {
    minHeight: "100vh",
    background: "#FAFAF8",
    fontFamily: "'Instrument Sans', sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "120px 32px 80px",
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    marginBottom: "48px",
  },
  pageTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "48px",
    fontWeight: 400,
    color: "#1A1A18",
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: "15px",
    color: "#9B9B94",
    margin: "6px 0 0",
    fontWeight: 400,
  },
  navBtn: (accent) => ({
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid #DEDAD4",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#4A4A44",
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "'Instrument Sans', sans-serif",
    transition: "all 0.15s",
  }),
  createBtn: {
    padding: "10px 22px",
    background: "#1A1A18",
    border: "1px solid #1A1A18",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#FAFAF8",
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "'Instrument Sans', sans-serif",
    transition: "background 0.15s",
  },
  searchBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "48px",
    background: "#FFFFFF",
    border: "1px solid #ECEAE4",
    borderRadius: "12px",
    padding: "6px 6px 6px 20px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "14px",
    color: "#2C2C28",
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 400,
  },
  searchBtn: {
    padding: "10px 22px",
    background: "#1A1A18",
    color: "#FAFAF8",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "'Instrument Sans', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #ECEAE4",
  },
  loading: {
    textAlign: "center",
    padding: "80px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#C4BFB4",
    letterSpacing: "0.08em",
  },
};

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

  const fetchBlogs = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiURL}/blogs`, {
        params: query ? { blogTitle: query } : {},
        headers: authHeaders(token),
      });
      setBlogs(getPageContent(res));
    } catch (error) {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUserStates = useCallback(async () => {
    if (!token) { setLikedIds(new Set()); setSavedIds(new Set()); return; }
    try {
      const [likedRes, savedRes] = await Promise.all([
        axios.get(`${apiURL}/users/me/blogs/like`, { headers: authHeaders(token) }),
        axios.get(`${apiURL}/users/me/blogs/save`, { headers: authHeaders(token) }),
      ]);
      setLikedIds(new Set(getPageContent(likedRes).map((b) => b.id)));
      setSavedIds(new Set(getPageContent(savedRes).map((b) => b.id)));
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
  useEffect(() => { fetchUserStates(); }, [fetchUserStates]);

  const handleLike = async (id) => {
    if (!token) return navigate("/signin");
    const wasLiked = likedIds.has(id);
    setLikedIds((prev) => { const n = new Set(prev); wasLiked ? n.delete(id) : n.add(id); return n; });
    setBlogs((prev) => prev.map((b) => b.id === id ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? -1 : 1)) } : b));
    try {
      await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: authHeaders(token) });
    } catch (e) {
      setLikedIds((prev) => { const n = new Set(prev); wasLiked ? n.add(id) : n.delete(id); return n; });
      setBlogs((prev) => prev.map((b) => b.id === id ? { ...b, likeCount: Math.max(0, (b.likeCount || 0) + (wasLiked ? 1 : -1)) } : b));
    }
  };

  const handleSave = async (id) => {
    if (!token) return navigate("/signin");
    const wasSaved = savedIds.has(id);
    setSavedIds((prev) => { const n = new Set(prev); wasSaved ? n.delete(id) : n.add(id); return n; });
    try {
      await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, { headers: authHeaders(token) });
      showToast(wasSaved ? "Removed from reading list" : "Saved to reading list", "success");
    } catch (e) {
      setSavedIds((prev) => { const n = new Set(prev); wasSaved ? n.add(id) : n.delete(id); return n; });
      showToast("Could not update save", "error");
    }
  };

  const resetForm = () => { setShowModal(false); setFormData({ title: "", content: "", image: null }); setPreview(null); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!token) return navigate("/signin");
    if (!formData.title.trim() || !formData.content.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(`${apiURL}/users/me/blogs`, { title: formData.title.trim(), content: formData.content.trim() }, { headers: authHeaders(token) });
      const created = getSingleData(res);
      if (formData.image && created?.id) {
        const fd = new FormData(); fd.append("image", formData.image);
        await axios.post(`${apiURL}/users/me/blogs/${created.id}/image`, fd, { headers: { ...authHeaders(token), "Content-Type": "multipart/form-data" } });
      }
      resetForm();
      await fetchBlogs(searchTerm);
      await fetchUserStates();
      showToast("Story published!", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not publish story", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
      <div style={S.page}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <Header />
        <div style={S.container}>
          <div style={S.headerRow}>
            <div>
              <h1 style={S.pageTitle}>The Feed</h1>
              <p style={S.subtitle}>Stories from the community</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { label: "MY STORIES", path: token ? "/blogs/me" : "/signin" },
                { label: "LIKED", path: token ? "/blogs/liked" : "/signin" },
                { label: "SAVED", path: token ? "/blogs/saved" : "/signin" },
              ].map(({ label, path }) => (
                  <button
                      key={label}
                      onClick={() => navigate(path)}
                      style={S.navBtn()}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F0EDE8"; e.currentTarget.style.borderColor = "#C4BFB4"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#DEDAD4"; }}
                  >
                    {label}
                  </button>
              ))}
              <button
                  onClick={() => token ? setShowModal(true) : navigate("/signin")}
                  style={S.createBtn}
                  onMouseEnter={e => e.currentTarget.style.background = "#2C2C28"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1A1A18"}
              >
                WRITE STORY
              </button>
            </div>
          </div>

          <div style={S.searchBar}>
            <input
                style={S.searchInput}
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchBlogs(searchTerm.trim())}
            />
            <button style={S.searchBtn} onClick={() => fetchBlogs(searchTerm.trim())}>Search</button>
          </div>

          {loading ? (
              <div style={S.loading}>LOADING STORIES...</div>
          ) : blogs.length > 0 ? (
              <div style={S.grid}>
                {blogs.map((blog) => (
                    <BlogCard
                        key={blog.id}
                        blog={{ ...blog, isLiked: likedIds.has(blog.id), isSaved: savedIds.has(blog.id) }}
                        onLike={handleLike}
                        onSave={handleSave}
                        isOwner={false}
                        token={token}
                    />
                ))}
              </div>
          ) : (
              <div style={S.emptyState}>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#2C2C28", margin: "0 0 8px" }}>No stories found</p>
                <p style={{ fontSize: "14px", color: "#9B9B94", margin: 0 }}>Try a different title or be the first to write one.</p>
              </div>
          )}
        </div>

        {showModal && (
            <div
                onClick={resetForm}
                style={{
                  position: "fixed", inset: 0, zIndex: 1000,
                  background: "rgba(10, 10, 10, 0.65)",
                  backdropFilter: "blur(6px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "24px",
                }}
            >
              <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#FAFAF8",
                    borderRadius: "20px",
                    width: "100%",
                    maxWidth: "540px",
                    padding: "40px",
                    animation: "slideModal 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
                  }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                  <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", fontWeight: 400, color: "#1A1A18", margin: 0 }}>
                    Publish Story
                  </h2>
                  <button onClick={resetForm} style={{ background: "#EFEDE8", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6B65" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                </div>

                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <input
                        type="text" placeholder="Story title" required maxLength={40}
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        style={{
                          width: "100%", padding: "14px 16px",
                          background: "#FFFFFF", border: "1px solid #ECEAE4",
                          borderRadius: "10px", outline: "none",
                          fontSize: "14px", fontWeight: 500, color: "#1A1A18",
                          fontFamily: "'Instrument Sans', sans-serif",
                          boxSizing: "border-box",
                        }}
                    />
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#B0ADA5", marginTop: "4px" }}>{formData.title.length}/40</div>
                  </div>

                  <div>
                                <textarea
                                    placeholder="Tell your story..." required rows="5" maxLength={400}
                                    value={formData.content}
                                    onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                                    style={{
                                      width: "100%", padding: "14px 16px",
                                      background: "#FFFFFF", border: "1px solid #ECEAE4",
                                      borderRadius: "10px", outline: "none",
                                      fontSize: "14px", color: "#1A1A18",
                                      fontFamily: "'DM Serif Display', serif",
                                      resize: "none", lineHeight: 1.7, boxSizing: "border-box",
                                    }}
                                />
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#B0ADA5", marginTop: "4px" }}>{formData.content.length}/400</div>
                  </div>

                  <div style={{ position: "relative", border: "1.5px dashed #DEDAD4", borderRadius: "10px", padding: "20px", textAlign: "center", background: "#FAFAF8" }}>
                    {preview ? (
                        <img src={preview} style={{ height: "120px", borderRadius: "8px", objectFit: "cover", margin: "0 auto" }} alt="Cover" />
                    ) : (
                        <div style={{ padding: "12px 0" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px", display: "block" }}>
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#C4BFB4" strokeWidth="1.5"/>
                            <circle cx="9" cy="11" r="2" stroke="#C4BFB4" strokeWidth="1.5"/>
                            <path d="M3 18l5-5 4 4 3-2.5 6 4" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                          <p style={{ fontSize: "12px", color: "#B0ADA5", margin: 0, fontWeight: 500 }}>Add a cover image (optional)</p>
                        </div>
                    )}
                    <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                           onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFormData((p) => ({ ...p, image: f })); setPreview(URL.createObjectURL(f)); } }} />
                  </div>

                  <button
                      type="submit" disabled={creating}
                      style={{
                        padding: "14px",
                        background: creating ? "#8A8A84" : "#1A1A18",
                        color: "#FAFAF8", border: "none",
                        borderRadius: "10px", fontSize: "13px",
                        fontWeight: 600, cursor: creating ? "not-allowed" : "pointer",
                        letterSpacing: "0.04em",
                        fontFamily: "'Instrument Sans', sans-serif",
                        transition: "background 0.15s",
                      }}
                  >
                    {creating ? "PUBLISHING..." : "PUBLISH STORY"}
                  </button>
                </form>
              </div>
            </div>
        )}

        <style>{`
                @keyframes slideModal { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                ::placeholder { color: #B0ADA5; }
            `}</style>
        <Footer />
      </div>
  );
};

export default Blogs;