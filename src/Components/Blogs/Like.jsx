import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import BlogCard from "./Blogs"; 

const LikedBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedBlogs = async () => {
      try {
        const response = await axios.get(`${apiURL}/users/me/blogs/like`);
        if (response.data.status === "OK") {
          setBlogs(response.data.data.content || []);
        }
      } catch (err) {
        console.error("Liked blogs fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedBlogs();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Liked blogs</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map(blog => (
          <div key={blog.id} className="border p-4 rounded-xl shadow-sm">
            <h3 className="font-bold">{blog.blogTitle}</h3>
            <p className="text-gray-600 line-clamp-2">{blog.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedBlogs;