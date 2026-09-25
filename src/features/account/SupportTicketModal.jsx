import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

const SupportTicketModal = ({ initialData, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({ subject: initialData?.subject || "", description: initialData?.description || "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save this ticket.");
    }
  };

  return (
    <Modal open onClose={onClose} title={initialData ? "Edit ticket" : "New support ticket"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <Field label="Subject" htmlFor="subject">
          <Input id="subject" required minLength={3} maxLength={40} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" required maxLength={2000} rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? "Save changes" : "Submit ticket"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SupportTicketModal;
