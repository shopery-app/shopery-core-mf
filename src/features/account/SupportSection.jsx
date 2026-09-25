import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { TicketIcon, PlusIcon, EditIcon, TrashIcon } from "../../components/ui/icons";
import SupportTicketModal from "./SupportTicketModal";
import * as supportApi from "../../api/supportTickets";
import { formatDate } from "../../utils/format";
import { useToast } from "../../components/ui/Toast";

const SupportSection = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    supportApi
      .getMySupportTickets()
      .then((data) => setTickets(data?.content || []))
      .catch(() => showToast("Failed to load support tickets.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(load, [load]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (modalState.mode === "edit") await supportApi.updateSupportTicket(modalState.data.id, form);
      else await supportApi.createSupportTicket(form);
      setModalState(null);
      load();
      showToast(modalState.mode === "edit" ? "Ticket updated." : "Ticket submitted.", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supportApi.deleteSupportTicket(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {modalState && (
        <SupportTicketModal
          initialData={modalState.mode === "edit" ? modalState.data : null}
          loading={saving}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete ticket"
        description="This support ticket will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="mb-5 flex justify-end">
        <Button size="sm" onClick={() => setModalState({ mode: "add" })}>
          <PlusIcon size={14} /> New ticket
        </Button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : tickets.length === 0 ? (
        <EmptyState icon={TicketIcon} title="No support tickets" description="Need help? Open a ticket and we'll get back to you." />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{t.subject}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-ink-secondary">{t.description}</p>
                  <p className="mt-2 text-[11.5px] text-ink-muted">Opened {formatDate(t.createdAt)}</p>
                </div>
                <Badge tone={t.status === "OPEN" ? "warning" : "success"}>{t.status}</Badge>
              </div>
              {t.status === "OPEN" && (
                <div className="mt-3 flex gap-3 border-t border-border pt-3">
                  <button onClick={() => setModalState({ mode: "edit", data: t })} className="flex items-center gap-1 text-[12px] font-medium text-ink-secondary hover:text-ink">
                    <EditIcon size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(t)} className="flex items-center gap-1 text-[12px] font-medium text-danger hover:opacity-80">
                    <TrashIcon size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportSection;
