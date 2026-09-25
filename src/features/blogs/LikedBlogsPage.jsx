import { useCallback, useEffect, useState } from "react";
import BlogsAccountLayout from "./BlogsAccountLayout";
import BlogCard from "./BlogCard";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { HeartIcon } from "../../components/ui/icons";
import * as blogsApi from "../../api/blogs";

const LikedBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    blogsApi
      .getLikedBlogs({ size: 50 })
      .then((data) => setBlogs(data?.content || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleUnlike = async (id) => {
    await blogsApi.likeBlog(id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BlogsAccountLayout title="Liked blogs" description="Stories you've liked.">
      {loading ? (
        <PageSpinner />
      ) : blogs.length === 0 ? (
        <EmptyState icon={HeartIcon} title="No liked blogs yet" description="Stories you like will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} liked onToggleLike={handleUnlike} />
          ))}
        </div>
      )}
    </BlogsAccountLayout>
  );
};

export default LikedBlogsPage;
