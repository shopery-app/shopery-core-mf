import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Tabs from "../../components/ui/Tabs";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PageSpinner, EmptyState } from "../../components/ui/Feedback";
import { LogOutIcon, InfoIcon, CheckIcon, CloseIcon, TicketIcon, StoreIcon, UserIcon } from "../../components/ui/icons";
import AdminDetailModal from "./AdminDetailModal";
import RejectTaskModal from "./RejectTaskModal";
import * as adminApi from "../../api/admin";
import { formatCurrency, formatDate, formatEnumLabel } from "../../utils/format";

const TABS = [
  { value: "users", label: "Users", icon: UserIcon },
  { value: "tasks", label: "Tasks", icon: TicketIcon },
  { value: "shops", label: "Shops", icon: StoreIcon },
];

const STATUS_TONE = { OPEN: "warning", CLOSED: "success", PENDING: "warning", APPROVED: "success", REJECTED: "danger", ACTIVE: "success" };

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState({ content: [], totalPages: 0 });
  const [tasks, setTasks] = useState({ content: [], totalPages: 0 });
  const [shops, setShops] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState({ users: 0, tasks: 0, shops: 0 });
  const [taskFilter, setTaskFilter] = useState("SHOP_CREATION_REQUEST");
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);
  const [closing, setClosing] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
    navigate("/admins");
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, t, s] = await Promise.all([
        adminApi.getUsers({ page: page.users, size: 10 }),
        adminApi.getTasks({ page: page.tasks, size: 10, taskCategory: taskFilter }),
        adminApi.getShops({ page: page.shops, size: 10 }),
      ]);
      setUsers({ content: u?.content || [], totalPages: u?.totalPages || 0 });
      setTasks({ content: t?.content || [], totalPages: t?.totalPages || 0 });
      setShops({ content: s?.content || [], totalPages: s?.totalPages || 0 });
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [page, taskFilter, handleLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCloseUser = async () => {
    setClosing(true);
    try {
      await adminApi.closeUser(closeTarget.id);
      setCloseTarget(null);
      load();
    } finally {
      setClosing(false);
    }
  };

  const handleApprove = async (id) => {
    await adminApi.approveTask(id);
    load();
  };

  const handleReject = async (id, reason) => {
    setRejecting(true);
    try {
      await adminApi.rejectTask(id, reason);
      setRejectTarget(null);
      load();
    } finally {
      setRejecting(false);
    }
  };

  const handleCloseTicket = async (id) => {
    await adminApi.closeTask(id);
    load();
  };

  const setTabPage = (n) => setPage((p) => ({ ...p, [tab]: n }));

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-ink-inverse">S</span>
            <span className="text-[15px] font-semibold text-ink">Shopery Admin</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOutIcon size={13} /> Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tabs items={TABS} value={tab} onChange={setTab} className="mb-6" />

        {tab === "tasks" && (
          <div className="mb-5 flex gap-2">
            {["SHOP_CREATION_REQUEST", "SUPPORT_TICKET"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setTaskFilter(cat);
                  setPage((p) => ({ ...p, tasks: 0 }));
                }}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium ${taskFilter === cat ? "border-ink bg-ink text-ink-inverse" : "border-border text-ink-secondary hover:bg-surface-sunken"}`}
              >
                {formatEnumLabel(cat)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <PageSpinner />
        ) : (
          <>
            {tab === "users" &&
              (users.content.length === 0 ? (
                <EmptyState title="No users" />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-surface-sunken text-[11px] uppercase tracking-wide text-ink-muted">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3">Shop</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.content.map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={user.profilePhoto} name={`${user.firstName} ${user.lastName}`} size="sm" />
                              <div>
                                <p className="font-medium text-ink">{user.firstName} {user.lastName}</p>
                                <p className="text-ink-muted">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-ink-secondary">{user.phone || "—"}</td>
                          <td className="px-4 py-3 text-ink-secondary">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3 text-ink-secondary">{user.shop?.shopName || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setDetail({ item: user, type: "user" })} className="text-ink-muted hover:text-ink">
                                <InfoIcon size={15} />
                              </button>
                              <Button size="sm" variant="outline" onClick={() => setCloseTarget(user)}>
                                Close
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

            {tab === "tasks" &&
              (tasks.content.length === 0 ? (
                <EmptyState title="No tasks" />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-surface-sunken text-[11px] uppercase tracking-wide text-ink-muted">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Requested by</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tasks.content.map((task) => {
                        const isTicket = task.taskCategory === "SUPPORT_TICKET";
                        const status = isTicket ? task.ticketStatus : task.requestStatus;
                        return (
                          <tr key={task.id}>
                            <td className="px-4 py-3 font-medium text-ink">{isTicket ? task.supportTicketSubject : task.shopName}</td>
                            <td className="px-4 py-3 text-ink-secondary">{task.taskCreatorDto?.name}</td>
                            <td className="px-4 py-3">
                              <Badge tone={STATUS_TONE[status] || "neutral"}>{status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-ink-secondary">{formatDate(task.createdAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setDetail({ item: task, type: "task" })} className="text-ink-muted hover:text-ink">
                                  <InfoIcon size={15} />
                                </button>
                                {!isTicket && status === "PENDING" && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleApprove(task.id)}>
                                      <CheckIcon size={12} /> Approve
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => setRejectTarget(task)}>
                                      <CloseIcon size={12} /> Reject
                                    </Button>
                                  </>
                                )}
                                {isTicket && status === "OPEN" && (
                                  <Button size="sm" variant="outline" onClick={() => handleCloseTicket(task.id)}>
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

            {tab === "shops" &&
              (shops.content.length === 0 ? (
                <EmptyState title="No shops" />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full text-left text-[13px]">
                    <thead className="border-b border-border bg-surface-sunken text-[11px] uppercase tracking-wide text-ink-muted">
                      <tr>
                        <th className="px-4 py-3">Shop</th>
                        <th className="px-4 py-3">Owner</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Income</th>
                        <th className="px-4 py-3 text-right">Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {shops.content.map((shop) => (
                        <tr key={shop.id}>
                          <td className="px-4 py-3 font-medium text-ink">{shop.shopName}</td>
                          <td className="px-4 py-3 text-ink-secondary">{shop.userEmail}</td>
                          <td className="px-4 py-3">
                            <Badge tone={STATUS_TONE[shop.shopStatus] || "neutral"}>{shop.shopStatus}</Badge>
                          </td>
                          <td className="px-4 py-3 text-ink-secondary">{formatCurrency(shop.totalIncome)}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => setDetail({ item: shop, type: "shop" })} className="text-ink-muted hover:text-ink">
                              <InfoIcon size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

            <div className="mt-6">
              <Pagination page={page[tab]} totalPages={(tab === "users" ? users : tab === "tasks" ? tasks : shops).totalPages} onPageChange={setTabPage} />
            </div>
          </>
        )}
      </div>

      {detail && <AdminDetailModal item={detail.item} type={detail.type} onClose={() => setDetail(null)} />}
      {rejectTarget && <RejectTaskModal task={rejectTarget} onConfirm={handleReject} onCancel={() => setRejectTarget(null)} loading={rejecting} />}
      <ConfirmDialog
        open={!!closeTarget}
        title="Close user account"
        description={`This will close the account for ${closeTarget?.email}.`}
        confirmLabel="Close account"
        destructive
        loading={closing}
        onConfirm={handleCloseUser}
        onCancel={() => setCloseTarget(null)}
      />
    </div>
  );
};

export default AdminDashboardPage;
