import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { PageSpinner, ErrorState } from "../../components/ui/Feedback";
import { ArrowLeftIcon, HeartIcon, BookmarkIcon, ImageIcon } from "../../components/ui/icons";
import * as blogsApi from "../../api/blogs";
import { isAuthenticated } from "../../utils/auth";
import { toImageSrc } from "../../utils/image";
import { formatDate } from "../../utils/format";

const BlogDetailPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    blogsApi
      .getBlogById(blogId)
      .then((data) => active && setBlog(data))
      .catch(() => active && setError("This story could not be found."))
      .finally(() => active && setLoading(false));

    if (isAuthenticated()) {
      Promise.all([blogsApi.getLikedBlogs({ size: 500 }), blogsApi.getSavedBlogs({ size: 500 })])
        .then(([likedData, savedData]) => {
          if (!active) return;
          setLiked((likedData?.content || []).some((b) => b.id === blogId));
          setSaved((savedData?.content || []).some((b) => b.id === blogId));
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [blogId]);

  if (loading) return <PageShell><PageSpinner /></PageShell>;

  if (error || !blog) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-4 py-16">
          <ErrorState title="Story not found" description={error} action={<Button onClick={() => navigate("/blogs")}>Back to blogs</Button>} />
        </div>
      </PageShell>
    );
  }

  const imageUrl = toImageSrc(blog.image);

  const handleLike = async () => {
    await blogsApi.likeBlog(blogId);
    setLiked((v) => !v);
    setBlog((b) => ({ ...b, likeCount: (b.likeCount || 0) + (liked ? -1 : 1) }));
  };

  const handleSave = async () => {
    await blogsApi.saveBlog(blogId);
    setSaved((v) => !v);
  };

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/blogs" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
          <ArrowLeftIcon size={14} /> Back to blogs
        </Link>

        <h1 className="text-3xl font-semibold leading-tight text-ink">{blog.blogTitle}</h1>

        <div className="mt-5 flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <Avatar src={blog.author?.profilePhoto} name={blog.author?.name} />
            <div>
              <p className="text-[13.5px] font-medium text-ink">{blog.author?.name}</p>
              <p className="text-[12px] text-ink-muted">{formatDate(blog.createdAt)}</p>
            </div>
          </div>
          {isAuthenticated() && (
            <div className="flex items-center gap-2">
              <button onClick={handleLike} className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium ${liked ? "border-danger/30 bg-danger-subtle text-danger" : "border-border text-ink-secondary hover:bg-surface-sunken"}`}>
                <HeartIcon size={14} filled={liked} /> {blog.likeCount ?? 0}
              </button>
              <button onClick={handleSave} className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium ${saved ? "border-ink bg-surface-sunken text-ink" : "border-border text-ink-secondary hover:bg-surface-sunken"}`}>
                <BookmarkIcon size={14} /> {saved ? "Saved" : "Save"}
              </button>
            </div>
          )}
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt={blog.blogTitle} className="mt-6 w-full rounded-lg object-cover" />
        ) : (
          <div className="mt-6 flex aspect-[16/8] w-full items-center justify-center rounded-lg bg-surface-sunken text-ink-muted">
            <ImageIcon size={32} />
          </div>
        )}

        <p className="mt-8 whitespace-pre-line text-[15px] leading-relaxed text-ink-secondary">{blog.content}</p>
      </article>
    </PageShell>
  );
};

export default BlogDetailPage;
