import { useCallback, useEffect, useState } from "react";
import BlogsAccountLayout from "./BlogsAccountLayout";
import BlogCard from "./BlogCard";
import Button from "../../components/ui/Button";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { BoxIcon as ArchiveIcon } from "../../components/ui/icons";
import * as blogsApi from "../../api/blogs";
import { useToast } from "../../components/ui/Toast";

const ArchivedBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    blogsApi
      .getArchivedBlogs({ size: 50 })
      .then((data) => setBlogs(data?.content || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleRestore = async (id) => {
    await blogsApi.archiveBlog(id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    showToast("Blog restored to My blogs.", "success");
  };

  return (
    <BlogsAccountLayout title="Archived blogs" description="Stories you've archived.">
      {loading ? (
        <PageSpinner />
      ) : blogs.length === 0 ? (
        <EmptyState icon={ArchiveIcon} title="No archived blogs" description="Archived stories will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="flex flex-col">
              <BlogCard blog={blog} />
              <Button size="sm" variant="outline" className="mt-2" onClick={() => handleRestore(blog.id)}>
                <ArchiveIcon size={12} /> Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </BlogsAccountLayout>
  );
};

export default ArchivedBlogsPage;
