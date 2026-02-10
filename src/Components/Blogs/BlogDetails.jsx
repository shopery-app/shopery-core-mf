import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import Header from "../Header";
import Footer from "../Footer";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${apiURL}/blogs/${id}`);
        setBlog(res.data.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  const handleLike = async () => {
    if(!token) return navigate("/signin");
    try {
        await axios.post(`${apiURL}/users/me/blogs/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` }});
        setBlog(prev => ({...prev, likeCount: (prev.likeCount || 0) + 1}));
    } catch(e) { console.error(e); }
  };

  const handleSave = async () => {
    if(!token) return navigate("/signin");
    try {
        await axios.post(`${apiURL}/users/me/blogs/${id}/save`, {}, { headers: { Authorization: `Bearer ${token}` }});
        alert("Story saved!");
    } catch(e) { console.error(e); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING...</div>;
  if (!blog) return <div className="h-screen flex flex-col items-center justify-center">Story not found. <button onClick={() => navigate("/blogs")}>Back</button></div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        
        <button onClick={() => navigate(-1)} className="mb-8 text-slate-400 font-bold text-[10px] tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors uppercase">
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
                            {blog.author?.name?.charAt(0)}
                        </div>
                     )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Written By</p>
                    <h4 className="font-bold text-slate-900 text-lg leading-none">{blog.author?.name}</h4>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                 <button onClick={handleLike} className="flex items-center gap-2 bg-rose-50 text-rose-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-rose-100 transition-colors">
                    <i className="fa-solid fa-heart"></i> {blog.likeCount}
                </button>
                 <button onClick={handleSave} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors">
                    <i className="fa-regular fa-bookmark"></i> Save
                </button>
            </div>
        </div>

        {blog.imageUrl && (
            <div className="mb-14">
                <img src={blog.imageUrl} className="w-full rounded-[2rem] shadow-xl" alt="" />
            </div>
        )}

        <div className="max-w-3xl mx-auto">
            <p className="text-slate-800 leading-[2] text-xl whitespace-pre-line font-serif">
                {blog.content}
            </p>
            <div className="mt-12 pt-12 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-sm italic">Published on {new Date(blog.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetails;