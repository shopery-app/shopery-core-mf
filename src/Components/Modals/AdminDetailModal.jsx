import React from "react";

const AdminDetailModal = ({ item, type, onClose }) => {
    if (!item) return null;

    const getStatusClassName = (status) => {
        const normalized = (status || "").toLowerCase();
        if (normalized === "open") return "status-badge open";
        if (normalized === "closed") return "status-badge closed";
        if (normalized === "pending") return "status-badge pending";
        if (normalized === "approved") return "status-badge approved";
        if (normalized === "rejected") return "status-badge rejected";
        if (normalized === "active") return "status-badge active";
        return "status-badge neutral";
    };

    const IdField = ({ label, value }) => (
        <div className="detail-field full">
            <span className="detail-label">{label}</span>
            <span className="detail-value mono id-value" title={value}>{value}</span>
        </div>
    );

    const Field = ({ label, value, full = false, children }) => (
        <div className={`detail-field${full ? " full" : ""}`}>
            <span className="detail-label">{label}</span>
            {children ?? <span className="detail-value">{value ?? "—"}</span>}
        </div>
    );

    const Divider = ({ label }) => (
        <div className="detail-divider">{label}</div>
    );

    const DescriptionBlock = ({ text }) => {
        if (!text) return <span className="detail-value">—</span>;
        return (
            <div className="description-block">
                <p>{text}</p>
            </div>
        );
    };

    const StatusPill = ({ status }) => (
        <span className={getStatusClassName(status)}>
            <span className="status-dot"></span>
            {status || "—"}
        </span>
    );

    const renderUser = () => (
        <div className="detail-grid">
            <div className="detail-avatar-row">
                <div className="detail-avatar">
                    {item.profilePhotoUrl
                        ? <img src={item.profilePhotoUrl} alt={item.firstName} />
                        : <span>{item.firstName?.[0] || "U"}</span>}
                </div>
                <div>
                    <h2 className="detail-name">{item.firstName} {item.lastName}</h2>
                    <p className="detail-email">{item.email}</p>
                </div>
            </div>

            <div className="detail-fields">
                <IdField label="User ID" value={item.id} />
                <Field label="Phone" value={item.phone} />
                <Field label="Date of Birth" value={item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : null} />
                <Field label="Joined" value={item.createdAt ? new Date(item.createdAt).toLocaleString() : null} />

                {item.shop && (
                    <>
                        <Divider label="Shop Info" />
                        <Field label="Shop Name" value={item.shop.shopName} />
                        <Field label="Shop Status">
                            <StatusPill status={item.shop.status} />
                        </Field>
                        <IdField label="Shop ID" value={item.shop.id} />
                    </>
                )}
            </div>
        </div>
    );

    const renderTask = () => {
        const status =
            item.taskCategory === "SUPPORT_TICKET"
                ? item.ticketStatus
                : item.requestStatus;

        return (
            <div className="detail-grid">
                <div className="detail-type-row">
                    <span className="type-badge">{item.taskCategory?.replaceAll("_", " ")}</span>
                    <StatusPill status={status} />
                </div>

                <div className="detail-fields">
                    <IdField label="Task ID" value={item.id} />

                    {item.taskCategory === "SHOP_CREATION_REQUEST" && (
                        <>
                            <Divider label="Shop Request" />
                            <Field label="Shop Name" value={item.shopName} />
                            <Field label="Subscription Tier">
                                <span className={`tier-badge ${item.subscriptionTier?.toLowerCase()}`}>
                                    {item.subscriptionTier || "—"}
                                </span>
                            </Field>
                            <Field label="Shop Description" full>
                                <DescriptionBlock text={item.shopDescription} />
                            </Field>
                        </>
                    )}

                    {item.taskCategory === "SUPPORT_TICKET" && (
                        <>
                            <Divider label="Support Ticket" />
                            <Field label="Subject" value={item.supportTicketSubject} full />
                            <Field label="Description" full>
                                <DescriptionBlock text={item.supportTicketDescription} />
                            </Field>
                        </>
                    )}

                    {item.rejectionReason && (
                        <Field label="Rejection Reason" full>
                            <span className="detail-value rejection">{item.rejectionReason}</span>
                        </Field>
                    )}

                    <Divider label="Requested By" />
                    <Field label="Name" value={item.taskCreatorDto?.name} />
                    <Field label="Email" value={item.taskCreatorDto?.email} />
                    <Field label="Phone" value={item.taskCreatorDto?.phone} />
                    <Field label="Created At" value={item.createdAt ? new Date(item.createdAt).toLocaleString() : null} />
                    <Field label="Last Updated" value={item.updatedAt ? new Date(item.updatedAt).toLocaleString() : null} />
                </div>
            </div>
        );
    };

    const renderShop = () => (
        <div className="detail-grid">
            <div className="detail-avatar-row">
                <div className="detail-avatar shop-detail-avatar">
                    <i className="fa-solid fa-store"></i>
                </div>
                <div>
                    <h2 className="detail-name">{item.shopName}</h2>
                    <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                        <StatusPill status={item.shopStatus} />
                        <span className={`tier-badge ${item.subscriptionTier?.toLowerCase()}`}>{item.subscriptionTier}</span>
                    </div>
                </div>
            </div>

            <div className="detail-fields">
                <IdField label="Shop ID" value={item.id} />
                <Field label="Owner Email" value={item.userEmail} />
                <Field label="User Status">
                    <StatusPill status={item.userStatus} />
                </Field>
                <Field label="Total Income" value={`$${item.totalIncome?.toFixed(2) ?? "0.00"}`} />
                <Field label="Rating" value={item.rating?.toFixed(1) ?? "0.0"} />
                <Field label="Total Products" value={item.totalProducts ?? 0} />
                <Field label="Created At" value={item.createdAt ? new Date(item.createdAt).toLocaleString() : null} />

                <Divider label="Description" />
                <Field label="Shop Description" full>
                    <DescriptionBlock text={item.description} />
                </Field>
            </div>
        </div>
    );

    const titleMap = {
        user: { icon: "fa-user", label: "User Details" },
        task: { icon: "fa-list-check", label: "Task Details" },
        shop: { icon: "fa-store", label: "Shop Details" },
    };
    const { icon, label } = titleMap[type] ?? { icon: "fa-circle-info", label: "Details" };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        <i className={`fa-solid ${icon} mr-2`}></i>
                        {label}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {type === "user" && renderUser()}
                    {type === "task" && renderTask()}
                    {type === "shop" && renderShop()}
                </div>
            </div>
        </div>
    );
};

export default AdminDetailModal;