import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import * as blogsApi from "../../api/blogs";

const BlogComposerModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: "", content: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const blog = await blogsApi.createBlog(form);
      if (image) await blogsApi.uploadBlogImage(blog.id, image);
      onCreated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not publish your story.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Write a story">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <Field label="Title" htmlFor="title">
          <Input id="title" required maxLength={40} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Content" htmlFor="content">
          <Textarea id="content" required maxLength={400} rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
        </Field>
        <Field label="Cover image (optional)" htmlFor="image">
          <input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="text-[13px] text-ink-secondary" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Publish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BlogComposerModal;
