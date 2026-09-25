import { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { updateProfile } from "../../store/slices/authSlice";

const EditProfileModal = ({ profile, onClose }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    phone: profile?.phone || "",
    dateOfBirth: profile?.dateOfBirth || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await dispatch(updateProfile({ ...form, dateOfBirth: form.dateOfBirth || null })).unwrap();
      onClose();
    } catch (err) {
      setError(err || "Could not update your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="firstName">
            <Input id="firstName" required maxLength={20} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <Input id="lastName" required maxLength={20} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          </Field>
        </div>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 555 010 2040" />
        </Field>
        <Field label="Date of birth" htmlFor="dob">
          <Input id="dob" type="date" value={form.dateOfBirth || ""} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
