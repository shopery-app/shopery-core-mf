import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import BlogCard from "./BlogCard";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", image: null });
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const fetchBlogs = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiURL}/blogs`, { 
        params: { blogTitle: query },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setBlogs(res.data.data.content || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleLike = async (id) => {
    if (!token) return navigate("/signin");
    try {
      await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setBlogs(prev => prev.map(b => b.id === id ? { ...b, likeCount: b.likeCount + 1 } : b));
    } catch (e) { console.error(e); }
  };

  const handleSave = async (id) => {
    if (!token) return navigate("/signin");
    try {
      await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, { headers: { Authorization: `Bearer ${token}` }});
      alert("Story saved to your reading list!");
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(`${apiURL}/users/me/blogs`, 
        { title: formData.title, content: formData.content },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      if (formData.image && res.data.data.id) {
        const imgData = new FormData();
        imgData.append("image", formData.image);
        await axios.post(`${apiURL}/users/me/blogs/${res.data.data.id}/image`, imgData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      }
      setShowModal(false);
      setFormData({ title: "", content: "", image: null });
      setPreview(null);
      fetchBlogs();
    } catch (err) { alert("Error creating blog"); } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">THE FEED</h1>
              <p className="text-slate-500 font-medium">Discover stories from the community.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/blogs/me")} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:border-emerald-500 transition-all">MY STORIES</button>
              <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">CREATE POST</button>
            </div>
        </div>

        <div className="bg-white p-2 rounded-2xl flex gap-2 mb-12 shadow-sm border border-slate-200">
            <input 
              className="flex-1 px-4 py-3 outline-none font-medium text-slate-700" 
              placeholder="Search by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => fetchBlogs(searchTerm)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase">Search</button>
        </div>

        {loading ? (
            <div className="py-20 text-center text-slate-400 font-bold animate-pulse">LOADING STORIES...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map(blog => (
                <BlogCard 
                  key={blog.id} 
                  blog={blog} 
                  onLike={handleLike} 
                  onSave={handleSave} 
                  isOwner={false}
                />
              ))}
            </div>
        )}
      </div>
      
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
                <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button>
                <h2 className="text-3xl font-black mb-6 italic">Publish Story</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <input type="text" placeholder="Title" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <textarea placeholder="Content" required rows="5" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                        {preview ? <img src={preview} className="h-32 rounded-xl object-cover mx-auto" alt="" /> : <p className="text-xs font-bold text-slate-400 uppercase">Click to add cover image</p>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files[0]; if(f) { setFormData({...formData, image: f}); setPreview(URL.createObjectURL(f)); }}} />
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">PUBLISH</button>
                </form>
             </div>
         </div>
      )}
      <Footer />
    </div>
  );
};

export default Blogs;