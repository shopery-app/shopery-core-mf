import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import { Field, Input, Textarea } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { PageSpinner, ErrorState } from "../../components/ui/Feedback";
import { ArrowLeftIcon, ImageIcon, UploadIcon, TrashIcon } from "../../components/ui/icons";
import * as blogsApi from "../../api/blogs";
import { toImageSrc } from "../../utils/image";
import { useToast } from "../../components/ui/Toast";

const EditBlogPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({ title: "", content: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    blogsApi
      .getMyBlog(blogId)
      .then((blog) => {
        setForm({ title: blog.blogTitle || "", content: blog.content || "" });
        setImageUrl(toImageSrc(blog.image));
      })
      .catch(() => setError("This story could not be loaded."))
      .finally(() => setLoading(false));
  }, [blogId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await blogsApi.updateBlog(blogId, form);
      showToast("Story updated.", "success");
      navigate("/blogs/me");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await blogsApi.uploadBlogImage(blogId, file);
      setImageUrl(toImageSrc(result));
    } catch {
      showToast("Could not upload the image.", "error");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleImageDelete = async () => {
    setUploadingImage(true);
    try {
      await blogsApi.deleteBlogImage(blogId);
      setImageUrl("");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return <PageShell><PageSpinner /></PageShell>;

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <button onClick={() => navigate("/blogs/me")} className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
          <ArrowLeftIcon size={14} /> Back to my blogs
        </button>

        <h1 className="mb-6 text-2xl font-semibold text-ink">Edit story</h1>

        {error && <ErrorState description={error} />}

        <div className="mb-6">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-sunken">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-muted">
                <ImageIcon size={30} />
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" loading={uploadingImage} onClick={() => fileRef.current?.click()}>
              <UploadIcon size={13} /> {imageUrl ? "Replace image" : "Upload image"}
            </Button>
            {imageUrl && (
              <Button size="sm" variant="ghost" onClick={handleImageDelete} disabled={uploadingImage}>
                <TrashIcon size={13} /> Remove
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Title" htmlFor="title">
            <Input id="title" required maxLength={40} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Content" htmlFor="content">
            <Textarea id="content" required maxLength={400} rows={8} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate("/blogs/me")}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default EditBlogPage;
