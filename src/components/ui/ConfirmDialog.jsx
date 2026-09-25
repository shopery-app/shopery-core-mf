import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={onCancel} title={title} size="sm">
    {description && <p className="text-[13.5px] leading-relaxed text-ink-secondary">{description}</p>}
    <div className="mt-5 flex justify-end gap-2">
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant={destructive ? "danger" : "primary"} size="sm" onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
