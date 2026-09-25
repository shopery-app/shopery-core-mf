import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { CheckIcon } from "../../components/ui/icons";
import * as dropdownsApi from "../../api/dropdowns";
import { createMyShop } from "../../store/slices/authSlice";

const CreateShopModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [tiers, setTiers] = useState([]);
  const [form, setForm] = useState({ shopName: "", description: "", subscriptionTier: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dropdownsApi
      .getDropdown("subscription-tiers")
      .then((data) => {
        setTiers(data || []);
        if (data?.[0]) setForm((f) => ({ ...f, subscriptionTier: data[0].name }));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await dispatch(createMyShop(form)).unwrap();
      onSuccess?.();
    } catch (err) {
      setError(err || "Could not submit your shop request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Open your shop" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

        <Field label="Shop name" htmlFor="shopName">
          <Input
            id="shopName"
            required
            minLength={3}
            maxLength={40}
            value={form.shopName}
            onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
            placeholder="e.g. Northside Electronics"
          />
        </Field>

        <Field label="Description" htmlFor="description" helper="Tell buyers what you sell.">
          <Textarea
            id="description"
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="A short description of your shop"
          />
        </Field>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-secondary">Subscription plan</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {tiers.map((tier) => (
              <button
                type="button"
                key={tier.name}
                onClick={() => setForm((f) => ({ ...f, subscriptionTier: tier.name }))}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  form.subscriptionTier === tier.name ? "border-ink bg-surface-sunken" : "border-border hover:border-border-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">{tier.name}</span>
                  {form.subscriptionTier === tier.name && <CheckIcon size={14} className="text-ink" />}
                </div>
                <p className="mt-1 text-[15px] font-semibold text-ink">${tier.price}<span className="text-[11px] font-normal text-ink-muted">/mo</span></p>
                <ul className="mt-2 space-y-1">
                  {tier.features?.map((f) => (
                    <li key={f} className="text-[11.5px] text-ink-muted">
                      · {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!form.subscriptionTier}>
            Submit request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateShopModal;
