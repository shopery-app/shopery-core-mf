import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import PageHeader from "../../components/ui/PageHeader";
import { Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/Feedback";
import { SearchIcon, EditIcon } from "../../components/ui/icons";
import BlogCard from "./BlogCard";
import BlogComposerModal from "./BlogComposerModal";
import useBlogInteractions from "../../hooks/useBlogInteractions";
import * as blogsApi from "../../api/blogs";
import { isAuthenticated } from "../../utils/auth";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const { likedIds, toggleLike } = useBlogInteractions();

  const load = (query = "") => {
    setLoading(true);
    setError("");
    const request = query.trim() ? blogsApi.searchBlogs(query.trim(), { size: 24 }) : blogsApi.getAllBlogs({ size: 24 });
    request
      .then((data) => setBlogs(data?.content || []))
      .catch(() => setError("Failed to load blogs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleToggleLike = async (id) => {
    const wasLiked = likedIds.has(id);
    await toggleLike(id);
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, likeCount: (b.likeCount || 0) + (wasLiked ? -1 : 1) } : b)));
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Blogs"
          description="Stories and updates from the Shopery community."
          actions={
            isAuthenticated() && (
              <>
                <Link to="/blogs/me">
                  <Button size="sm" variant="outline">
                    My blogs
                  </Button>
                </Link>
                <Button size="sm" onClick={() => setComposerOpen(true)}>
                  <EditIcon size={13} /> Write
                </Button>
              </>
            )
          }
        />

        {composerOpen && (
          <BlogComposerModal
            onClose={() => setComposerOpen(false)}
            onCreated={() => {
              setComposerOpen(false);
              load();
            }}
          />
        )}

        <form onSubmit={handleSearch} className="mb-6 max-w-md">
          <div className="relative">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stories…" className="h-11 pl-10" />
          </div>
        </form>

        {error && <ErrorState description={error} action={<Button size="sm" onClick={() => load(search)}>Try again</Button>} />}

        {!error && loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!error && !loading && blogs.length === 0 && <EmptyState title="No stories found" description="Try a different search." />}

        {!loading && blogs.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                liked={likedIds.has(blog.id)}
                onToggleLike={isAuthenticated() ? handleToggleLike : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default BlogsPage;
