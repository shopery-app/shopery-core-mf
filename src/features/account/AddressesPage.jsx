import { useCallback, useEffect, useState } from "react";
import AccountLayout from "../../components/layout/AccountLayout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { MapPinIcon, PlusIcon, EditIcon, TrashIcon, CheckIcon } from "../../components/ui/icons";
import AddressModal from "./AddressModal";
import * as addressesApi from "../../api/addresses";
import { formatEnumLabel } from "../../utils/format";
import { useToast } from "../../components/ui/Toast";

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // { mode: 'add' | 'edit', data? }
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    addressesApi
      .getMyAddresses()
      .then(setAddresses)
      .catch(() => showToast("Failed to load addresses.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(load, [load]);

  const handleSubmit = async (form) => {
    setSaving(true);
    const { isDefault, ...payload } = form;
    try {
      let saved;
      if (modalState.mode === "edit") {
        saved = await addressesApi.updateAddress(modalState.data.id, payload);
      } else {
        saved = await addressesApi.addAddress(payload);
      }
      if (isDefault && !saved.isDefault) {
        await addressesApi.setDefaultAddress(saved.id);
      }
      setModalState(null);
      load();
      showToast(modalState.mode === "edit" ? "Address updated." : "Address added.", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await addressesApi.removeAddress(deleteTarget.id);
      setDeleteTarget(null);
      load();
      showToast("Address removed.", "success");
    } catch {
      showToast("Could not remove this address.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressesApi.setDefaultAddress(id);
      load();
    } catch {
      showToast("Could not set default address.", "error");
    }
  };

  return (
    <AccountLayout title="Addresses" description="Manage the addresses used for your orders.">
      {modalState && (
        <AddressModal
          initialData={modalState.mode === "edit" ? modalState.data : null}
          loading={saving}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove address"
        description="This address will be permanently removed from your account."
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="mb-5 flex justify-end">
        <Button size="sm" onClick={() => setModalState({ mode: "add" })}>
          <PlusIcon size={14} /> Add address
        </Button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : addresses.length === 0 ? (
        <EmptyState icon={MapPinIcon} title="No addresses yet" description="Add an address to speed up checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge tone="neutral">{formatEnumLabel(addr.addressType)}</Badge>
                {addr.isDefault && <Badge tone="accent">Default</Badge>}
              </div>
              <p className="text-[13.5px] leading-relaxed text-ink-secondary">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                <br />
                {addr.city}, {addr.country} {addr.postalCode}
              </p>
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="flex items-center gap-1 text-[12px] font-medium text-ink-secondary hover:text-ink">
                    <CheckIcon size={12} /> Set default
                  </button>
                )}
                <button onClick={() => setModalState({ mode: "edit", data: addr })} className="ml-auto flex items-center gap-1 text-[12px] font-medium text-ink-secondary hover:text-ink">
                  <EditIcon size={12} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(addr)} className="flex items-center gap-1 text-[12px] font-medium text-danger hover:opacity-80">
                  <TrashIcon size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
};

export default AddressesPage;
