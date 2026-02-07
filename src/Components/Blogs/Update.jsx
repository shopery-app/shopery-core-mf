import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const SavedBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedBlogs = async () => {
      try {
        const response = await axios.get(`${apiURL}/users/me/blogs/save`);
        if (response.data.status === "OK") {
          setBlogs(response.data.data.content || []);
        }
      } catch (err) {
        console.error("Saved blogs fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedBlogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Saved blogs</h2>
     
    </div>
  );
};

export default SavedBlogs;