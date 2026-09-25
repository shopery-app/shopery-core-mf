import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { formatCurrency, formatDate, formatEnumLabel } from "../../utils/format";

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-border py-2.5 text-[13px] last:border-b-0">
    <span className="text-ink-muted">{label}</span>
    <span className="font-medium text-ink">{value ?? "—"}</span>
  </div>
);

const AdminDetailModal = ({ item, type, onClose }) => {
  if (!item) return null;

  return (
    <Modal open onClose={onClose} title={type === "user" ? "User details" : type === "shop" ? "Shop details" : "Task details"}>
      {type === "user" && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Avatar src={item.profilePhoto} name={`${item.firstName} ${item.lastName}`} size="lg" />
            <div>
              <p className="text-[15px] font-semibold text-ink">
                {item.firstName} {item.lastName}
              </p>
              <p className="text-[12.5px] text-ink-muted">{item.email}</p>
            </div>
          </div>
          <Row label="Phone" value={item.phone} />
          <Row label="Date of birth" value={item.dateOfBirth ? formatDate(item.dateOfBirth) : null} />
          <Row label="Joined" value={formatDate(item.createdAt)} />
          <Row label="Shop" value={item.shop?.shopName} />
        </div>
      )}

      {type === "shop" && (
        <div>
          <Row label="Shop name" value={item.shopName} />
          <Row label="Owner" value={item.userEmail} />
          <Row label="Status" value={<Badge tone={item.shopStatus === "ACTIVE" ? "success" : "neutral"}>{item.shopStatus}</Badge>} />
          <Row label="Plan" value={item.subscriptionTier} />
          <Row label="Rating" value={item.rating?.toFixed(1)} />
          <Row label="Products" value={item.totalProducts} />
          <Row label="Income" value={formatCurrency(item.totalIncome)} />
          <Row label="Created" value={formatDate(item.createdAt)} />
          {item.description && <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{item.description}</p>}
        </div>
      )}

      {type === "task" && (
        <div>
          <Row label="Type" value={formatEnumLabel(item.taskCategory)} />
          <Row label="Requested by" value={item.taskCreatorDto?.name} />
          <Row label="Email" value={item.taskCreatorDto?.email} />
          <Row label="Phone" value={item.taskCreatorDto?.phone} />
          {item.taskCategory === "SUPPORT_TICKET" ? (
            <>
              <Row label="Subject" value={item.supportTicketSubject} />
              <Row label="Status" value={item.ticketStatus} />
              <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{item.supportTicketDescription}</p>
            </>
          ) : (
            <>
              <Row label="Shop name" value={item.shopName} />
              <Row label="Plan" value={item.subscriptionTier} />
              <Row label="Status" value={item.requestStatus} />
              {item.rejectionReason && <Row label="Rejection reason" value={item.rejectionReason} />}
              {item.shopDescription && <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{item.shopDescription}</p>}
            </>
          )}
          <Row label="Created" value={formatDate(item.createdAt)} />
        </div>
      )}
    </Modal>
  );
};

export default AdminDetailModal;
