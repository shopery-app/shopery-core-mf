import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BlogsAccountLayout from "./BlogsAccountLayout";
import BlogCard from "./BlogCard";
import BlogComposerModal from "./BlogComposerModal";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { EditIcon, TrashIcon, BoxIcon as ArchiveIcon, PlusIcon } from "../../components/ui/icons";
import * as blogsApi from "../../api/blogs";
import useBlogInteractions from "../../hooks/useBlogInteractions";
import { useToast } from "../../components/ui/Toast";

const MyBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { likedIds, toggleLike } = useBlogInteractions();
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    blogsApi
      .getMyBlogs({ size: 50 })
      .then((data) => setBlogs(data?.content || []))
      .catch(() => showToast("Failed to load your blogs.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(load, [load]);

  const handleArchive = async (id) => {
    await blogsApi.archiveBlog(id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    showToast("Blog archived.", "success");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogsApi.deleteBlog(deleteTarget.id);
      setBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BlogsAccountLayout
      title="My blogs"
      description="Stories you've written."
      actions={
        <Button size="sm" onClick={() => setComposerOpen(true)}>
          <PlusIcon size={14} /> New story
        </Button>
      }
    >
      {composerOpen && (
        <BlogComposerModal
          onClose={() => setComposerOpen(false)}
          onCreated={() => {
            setComposerOpen(false);
            load();
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete story"
        description="This story will be permanently deleted."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {loading ? (
        <PageSpinner />
      ) : blogs.length === 0 ? (
        <EmptyState title="No stories yet" description="Share something with the community." action={<Button size="sm" onClick={() => setComposerOpen(true)}>Write your first story</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="flex flex-col">
              <BlogCard blog={blog} liked={likedIds.has(blog.id)} onToggleLike={toggleLike} />
              <div className="mt-2 flex gap-2">
                <Link to={`/blogs/edit/${blog.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[12px] font-medium text-ink-secondary hover:bg-surface-sunken">
                  <EditIcon size={12} /> Edit
                </Link>
                <button onClick={() => handleArchive(blog.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[12px] font-medium text-ink-secondary hover:bg-surface-sunken">
                  <ArchiveIcon size={12} /> Archive
                </button>
                <button onClick={() => setDeleteTarget(blog)} className="flex items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-danger hover:bg-danger-subtle">
                  <TrashIcon size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </BlogsAccountLayout>
  );
};

export default MyBlogsPage;
