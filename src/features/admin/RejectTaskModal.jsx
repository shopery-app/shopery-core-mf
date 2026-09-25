import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { Field, Textarea } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

const RejectTaskModal = ({ task, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");

  return (
    <Modal open onClose={onCancel} title="Reject shop request">
      <p className="mb-4 text-[13px] text-ink-secondary">
        Rejecting <span className="font-medium text-ink">{task.shopName}</span> requested by {task.taskCreatorDto?.name}.
      </p>
      <Field label="Reason" htmlFor="reason" required>
        <Textarea id="reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this request is being rejected…" />
      </Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" loading={loading} disabled={!reason.trim()} onClick={() => onConfirm(task.id, reason.trim())}>
          Confirm rejection
        </Button>
      </div>
    </Modal>
  );
};

export default RejectTaskModal;
