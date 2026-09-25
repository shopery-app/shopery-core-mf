import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Checkbox } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import * as dropdownsApi from "../../api/dropdowns";
import { formatEnumLabel } from "../../utils/format";

const emptyForm = { addressLine1: "", addressLine2: "", city: "", country: "", postalCode: "", addressType: "HOUSE", isDefault: false };

const AddressModal = ({ initialData, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(initialData ? { ...emptyForm, ...initialData } : emptyForm);
  const [types, setTypes] = useState(["HOUSE", "OFFICE", "APARTMENT", "HOTEL", "OTHER"]);
  const [error, setError] = useState("");

  useEffect(() => {
    dropdownsApi.getDropdown("address-types").then((data) => Array.isArray(data) && data.length && setTypes(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save this address.");
    }
  };

  return (
    <Modal open onClose={onClose} title={initialData ? "Edit address" : "Add address"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

        <Field label="Address line 1" htmlFor="addressLine1">
          <Input id="addressLine1" required maxLength={100} value={form.addressLine1} onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))} />
        </Field>
        <Field label="Address line 2" htmlFor="addressLine2">
          <Input id="addressLine2" maxLength={100} value={form.addressLine2 || ""} onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" htmlFor="city">
            <Input id="city" required maxLength={100} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input id="country" required maxLength={100} value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code" htmlFor="postalCode">
            <Input id="postalCode" required maxLength={20} value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
          </Field>
          <Field label="Type" htmlFor="addressType">
            <Select id="addressType" value={form.addressType} onChange={(e) => setForm((f) => ({ ...f, addressType: e.target.value }))}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {formatEnumLabel(t)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Checkbox label="Set as default address" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save address
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressModal;
