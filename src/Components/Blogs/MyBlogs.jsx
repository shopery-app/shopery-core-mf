import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";
import BlogCard from "./BlogCard";

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const fetchMyBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiURL}/users/me/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data.data.content || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchMyBlogs(); }, [fetchMyBlogs]);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this story permanently?")) return;
    try {
      await axios.delete(`${apiURL}/users/me/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleLike = async (id) => {
    try {
       await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` }});
       setBlogs(prev => prev.map(b => b.id === id ? { ...b, likeCount: b.likeCount + 1 } : b));
    } catch(e) { console.error(e); }
  };
  
  const handleSave = async (id) => {
      try {
        await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, { headers: { Authorization: `Bearer ${token}` }});
        alert("Saved!");
      } catch(e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-900 italic">MY WORKSHOP</h1>
                <p className="text-slate-500 font-medium">Manage your published content.</p>
            </div>
            <button onClick={() => navigate("/blogs")} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50">BACK TO FEED</button>
        </div>

        {loading ? (
            <div className="py-20 text-center font-bold text-slate-300">LOADING YOUR STORIES...</div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map(blog => (
                  <BlogCard 
                    key={blog.id}
                    blog={blog}
                    isOwner={true}
                    onDelete={handleDelete}
                    onEdit={(id) => navigate(`/blogs/edit/${id}`)}
                    onLike={handleLike}
                    onSave={handleSave}
                  />
              ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">No stories yet.</h2>
              <button onClick={() => navigate("/blogs")} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs">CREATE ONE IN FEED</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBlogs;