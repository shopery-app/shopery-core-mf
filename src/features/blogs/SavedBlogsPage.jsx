import { useCallback, useEffect, useState } from "react";
import BlogsAccountLayout from "./BlogsAccountLayout";
import BlogCard from "./BlogCard";
import Button from "../../components/ui/Button";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { BookmarkIcon } from "../../components/ui/icons";
import * as blogsApi from "../../api/blogs";
import useBlogInteractions from "../../hooks/useBlogInteractions";

const SavedBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { likedIds, toggleLike } = useBlogInteractions();

  const load = useCallback(() => {
    setLoading(true);
    blogsApi
      .getSavedBlogs({ size: 50 })
      .then((data) => setBlogs(data?.content || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleUnsave = async (id) => {
    await blogsApi.saveBlog(id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BlogsAccountLayout title="Saved blogs" description="Your reading list.">
      {loading ? (
        <PageSpinner />
      ) : blogs.length === 0 ? (
        <EmptyState icon={BookmarkIcon} title="No saved blogs yet" description="Save stories to read them later." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="flex flex-col">
              <BlogCard blog={blog} liked={likedIds.has(blog.id)} onToggleLike={toggleLike} />
              <Button size="sm" variant="outline" className="mt-2" onClick={() => handleUnsave(blog.id)}>
                <BookmarkIcon size={12} /> Remove from saved
              </Button>
            </div>
          ))}
        </div>
      )}
    </BlogsAccountLayout>
  );
};

export default SavedBlogsPage;
