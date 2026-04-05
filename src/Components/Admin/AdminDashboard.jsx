import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
import { apiURL } from "../../Backend/Api/api";
import AdminDetailModal from "../Modals/AdminDetailModal";

// ─── Reject Modal ─────────────────────────────────────────────────────────────

const RejectModal = ({ task, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  if (!task) return null;

  return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-box reject-modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              <i className="fa-solid fa-circle-xmark mr-2" style={{ color: "var(--rose)" }}></i>
              Reject Request
            </h3>
            <button className="modal-close" onClick={onCancel}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="reject-shop-info">
              <span className="detail-label">Shop Request</span>
              <strong className="reject-shop-name">{task.shopName || "—"}</strong>
              <span className="text-muted">by {task.taskCreatorDto?.name || "—"}</span>
            </div>
            <div className="reject-field">
              <label className="detail-label" htmlFor="reject-reason">
                Rejection Reason <span style={{ color: "var(--rose)" }}>*</span>
              </label>
              <textarea
                  id="reject-reason"
                  className="reject-textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                  autoFocus
              />
              {reason.trim() === "" && (
                  <span className="reject-hint">This field is required.</span>
              )}
            </div>
            <div className="reject-actions">
              <button className="reject-cancel-btn" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button
                  className="reject-confirm-btn"
                  onClick={() => reason.trim() && onConfirm(task.id, reason.trim())}
                  disabled={!reason.trim() || loading}
              >
                {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Rejecting...
                    </>
                ) : (
                    <>
                      <i className="fa-solid fa-xmark"></i> Confirm Rejection
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [taskPage, setTaskPage] = useState(0);
  const [taskTotalPages, setTaskTotalPages] = useState(0);
  const [shopPage, setShopPage] = useState(0);
  const [shopTotalPages, setShopTotalPages] = useState(0);
  const [taskFilter, setTaskFilter] = useState("");

  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectTask, setRejectTask] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("adminAccessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/admins");
  }, [navigate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = getAuthConfig();
      const [usersRes, tasksRes, shopsRes] = await Promise.all([
        axios.get(`${apiURL}/admins/users`, {
          ...cfg,
          params: { page: userPage, size: 10 },
        }),
        axios.get(`${apiURL}/admins/tasks`, {
          ...cfg,
          params: { page: taskPage, size: 10, taskCategory: taskFilter || undefined },
        }),
        axios.get(`${apiURL}/admins/shops`, {
          ...cfg,
          params: { page: shopPage, size: 10 },
        }),
      ]);

      const ud = usersRes?.data?.data;
      setUsers(ud?.content || []);
      setUserTotalPages(ud?.page?.totalPages || ud?.totalPages || 0);

      const td = tasksRes?.data?.data;
      setTasks(td?.content || []);
      setTaskTotalPages(td?.page?.totalPages || td?.totalPages || 0);

      const sd = shopsRes?.data?.data;
      setShops(sd?.content || []);
      setShopTotalPages(sd?.page?.totalPages || sd?.totalPages || 0);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) handleLogout();
      else console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [userPage, taskPage, taskFilter, shopPage, getAuthConfig, handleLogout]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCloseUser = async (userId) => {
    try {
      await axios.patch(`${apiURL}/admins/users/${userId}/close`, {}, getAuthConfig());
      fetchAll();
    } catch (err) {
      console.error("Close user failed:", err);
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      await axios.post(`${apiURL}/admins/tasks/${taskId}/approve`, {}, getAuthConfig());
      fetchAll();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleRejectConfirm = async (taskId, reason) => {
    setRejectLoading(true);
    try {
      await axios.post(`${apiURL}/admins/tasks/${taskId}/reject`, { reason }, getAuthConfig());
      setRejectTask(null);
      fetchAll();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCloseTask = async (taskId) => {
    try {
      await axios.patch(`${apiURL}/admins/tasks/${taskId}/close`, {}, getAuthConfig());
      fetchAll();
    } catch (err) {
      console.error("Close task failed:", err);
    }
  };

  const openModal = (item, type) => {
    setModalItem(item);
    setModalType(type);
  };

  const closeModal = () => {
    setModalItem(null);
    setModalType(null);
  };

  const getTaskStatus = (task) =>
      task.taskCategory === "SUPPORT_TICKET" ? task.ticketStatus : task.requestStatus;

  const getTaskShopName = (task) =>
      task.taskCategory === "SHOP_CREATION_REQUEST" ? task.shopName : null;

  const getTaskTier = (task) =>
      task.taskCategory === "SHOP_CREATION_REQUEST" ? task.subscriptionTier : null;

  const renderTaskActions = (task) => {
    const status = getTaskStatus(task);

    if (task.taskCategory === "SHOP_CREATION_REQUEST") {
      if (status !== "PENDING") {
        return (
            <span className="completed-stamp">
            <i
                className={`fa-solid ${
                    status === "APPROVED" ? "fa-circle-check" : "fa-circle-xmark"
                }`}
            ></i>
              {status}
          </span>
        );
      }

      return (
          <div className="action-group">
            <button
                onClick={() => handleApproveTask(task.id)}
                className="btn-circle success"
                title="Approve"
            >
              <i className="fa-solid fa-check"></i>
            </button>
            <button
                onClick={() => setRejectTask(task)}
                className="btn-circle danger"
                title="Reject"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
      );
    }

    if (task.taskCategory === "SUPPORT_TICKET") {
      if (status === "CLOSED") {
        return (
            <span className="completed-stamp">
            <i className="fa-solid fa-circle-check"></i>
              {status}
          </span>
        );
      }

      return (
          <button onClick={() => handleCloseTask(task.id)} className="btn-resolve">
            <i className="fa-solid fa-check-double"></i> Resolve
          </button>
      );
    }

    return <span className="text-muted">—</span>;
  };

  const pendingTasks = tasks.filter((t) => {
    if (t.taskCategory === "SUPPORT_TICKET") return t.ticketStatus === "OPEN";
    return t.requestStatus === "PENDING";
  }).length;
  const activeShops = shops.filter((s) => s.shopStatus === "ACTIVE").length;

  const currentPage = activeTab === "users" ? userPage : activeTab === "tasks" ? taskPage : shopPage;
  const totalPages =
      activeTab === "users" ? userTotalPages : activeTab === "tasks" ? taskTotalPages : shopTotalPages;

  const setPage = (p) => {
    if (activeTab === "users") setUserPage(p);
    else if (activeTab === "tasks") setTaskPage(p);
    else setShopPage(p);
  };

  return (
      <div className="admin-wrapper">
        <header className="glass-nav">
          <div className="nav-container">
            <div className="logo-section">
              <div className="logo-icon">S</div>
              <span className="logo-text">
              Shopery<span>Admin</span>
            </span>
            </div>
            <div className="nav-right">
              <button onClick={fetchAll} disabled={loading} className="reload-btn" title="Reload all data">
                <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}></i>
                {loading ? "Syncing..." : "Sync Data"}
              </button>
              <button onClick={handleLogout} className="logout-pill">
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <section className="stats-grid">
            <div className="stat-card indigo">
              <div className="stat-icon">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
            </div>

            <div className="stat-card emerald">
              <div className="stat-icon">
                <i className="fa-solid fa-store"></i>
              </div>
              <div className="stat-info">
                <h3>Active Shops</h3>
                <p>{activeShops}</p>
              </div>
            </div>

            <div className="stat-card amber">
              <div className="stat-icon">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <div className="stat-info">
                <h3>Tasks</h3>
                <p>{tasks.length}</p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div className="stat-info">
                <h3>Pending Review</h3>
                <p>{pendingTasks}</p>
              </div>
            </div>
          </section>

          <div className="control-bar glass-card">
            <div className="pill-tabs">
              <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
                <i className="fa-solid fa-users"></i> Users
              </button>
              <button className={activeTab === "tasks" ? "active" : ""} onClick={() => setActiveTab("tasks")}>
                <i className="fa-solid fa-list-check"></i> Tasks
              </button>
              <button className={activeTab === "shops" ? "active" : ""} onClick={() => setActiveTab("shops")}>
                <i className="fa-solid fa-store"></i> Shops
              </button>
            </div>

            {activeTab === "tasks" && (
                <div className="sub-pill-filter">
                  <button
                      className={taskFilter === "" ? "active" : ""}
                      onClick={() => {
                        setTaskFilter("");
                        setTaskPage(0);
                      }}
                  >
                    All
                  </button>
                  <button
                      className={taskFilter === "SHOP_CREATION_REQUEST" ? "active" : ""}
                      onClick={() => {
                        setTaskFilter("SHOP_CREATION_REQUEST");
                        setTaskPage(0);
                      }}
                  >
                    <i className="fa-solid fa-store"></i> Shop Requests
                  </button>
                  <button
                      className={taskFilter === "SUPPORT_TICKET" ? "active" : ""}
                      onClick={() => {
                        setTaskFilter("SUPPORT_TICKET");
                        setTaskPage(0);
                      }}
                  >
                    <i className="fa-solid fa-headset"></i> Support Tickets
                  </button>
                </div>
            )}
          </div>

          <div className="data-container glass-card">
            {loading ? (
                <div className="modern-loader">
                  <div></div>
                </div>
            ) : (
                <div className="table-responsive">
                  <table className="modern-table">
                    {activeTab === "users" && (
                        <>
                          <thead>
                          <tr>
                            <th>User</th>
                            <th>Phone</th>
                            <th>Date of Birth</th>
                            <th>Joined</th>
                            <th>Shop</th>
                            <th>Actions</th>
                            <th>Info</th>
                          </tr>
                          </thead>
                          <tbody>
                          {users.length === 0 && (
                              <tr>
                                <td colSpan="7" className="empty-row">
                                  No users found.
                                </td>
                              </tr>
                          )}
                          {users.map((user) => (
                              <tr key={user.id}>
                                <td>
                                  <div className="user-cell">
                                    <div className="avatar">
                                      {user.profilePhotoUrl ? (
                                          <img src={user.profilePhotoUrl} alt={user.firstName} className="avatar-img" />
                                      ) : (
                                          user.firstName?.[0] || "U"
                                      )}
                                    </div>
                                    <div>
                                      <strong>
                                        {user.firstName} {user.lastName}
                                      </strong>
                                      <p className="text-muted">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td>{user.phone || "—"}</td>
                                <td>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "—"}</td>
                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                                <td>
                                  {user.shop ? (
                                      <span className="status-badge approved">{user.shop.shopName}</span>
                                  ) : (
                                      <span className="text-muted">—</span>
                                  )}
                                </td>
                                <td>
                                  <button onClick={() => handleCloseUser(user.id)} className="btn-icon danger">
                                    <i className="fa-solid fa-user-slash"></i> Close
                                  </button>
                                </td>
                                <td>
                                  <button
                                      onClick={() => openModal(user, "user")}
                                      className="btn-info-col"
                                      title="View Details"
                                  >
                                    <i className="fa-solid fa-circle-info"></i>
                                  </button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </>
                    )}

                    {activeTab === "tasks" && (
                        <>
                          <thead>
                          <tr>
                            <th>Type</th>
                            <th>Shop Name</th>
                            <th>Tier</th>
                            <th>Status</th>
                            <th>Requested By</th>
                            <th>Date</th>
                            <th>Actions</th>
                            <th>Info</th>
                          </tr>
                          </thead>
                          <tbody>
                          {tasks.length === 0 && (
                              <tr>
                                <td colSpan="8" className="empty-row">
                                  No tasks found.
                                </td>
                              </tr>
                          )}
                          {tasks.map((task) => {
                            const status = getTaskStatus(task);
                            const shopName = getTaskShopName(task);
                            const tier = getTaskTier(task);

                            return (
                                <tr key={task.id}>
                                  <td>
                                    <span className="type-badge">{task.taskCategory?.replaceAll("_", " ")}</span>
                                  </td>
                                  <td>
                                    <strong>{shopName || "—"}</strong>
                                  </td>
                                  <td>
                                    {tier ? (
                                        <span className={`tier-badge ${tier.toLowerCase()}`}>{tier}</span>
                                    ) : (
                                        "—"
                                    )}
                                  </td>
                                  <td>
                                    <span className={`status-badge ${status?.toLowerCase()}`}>{status || "—"}</span>
                                  </td>
                                  <td>
                                    <strong>{task.taskCreatorDto?.name || "—"}</strong>
                                    <p className="text-muted">{task.taskCreatorDto?.email}</p>
                                  </td>
                                  <td>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "—"}</td>
                                  <td>{renderTaskActions(task)}</td>
                                  <td>
                                    <button
                                        onClick={() => openModal(task, "task")}
                                        className="btn-info-col"
                                        title="View Details"
                                    >
                                      <i className="fa-solid fa-circle-info"></i>
                                    </button>
                                  </td>
                                </tr>
                            );
                          })}
                          </tbody>
                        </>
                    )}

                    {activeTab === "shops" && (
                        <>
                          <thead>
                          <tr>
                            <th>Shop</th>
                            <th>Owner</th>
                            <th>Tier</th>
                            <th>Status</th>
                            <th>Rating</th>
                            <th>Products</th>
                            <th>Income</th>
                            <th>Created</th>
                            <th>Info</th>
                          </tr>
                          </thead>
                          <tbody>
                          {shops.length === 0 && (
                              <tr>
                                <td colSpan="9" className="empty-row">
                                  No shops found.
                                </td>
                              </tr>
                          )}
                          {shops.map((shop) => (
                              <tr key={shop.id}>
                                <td>
                                  <div className="user-cell">
                                    <div className="avatar shop-avatar">
                                      <i className="fa-solid fa-store"></i>
                                    </div>
                                    <strong>{shop.shopName}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span className="text-muted">{shop.userEmail || "—"}</span>
                                </td>
                                <td>
                                  {shop.subscriptionTier && shop.subscriptionTier !== "NONE" ? (
                                      <span className={`tier-badge ${shop.subscriptionTier.toLowerCase()}`}>
                                {shop.subscriptionTier}
                              </span>
                                  ) : (
                                      <span className="text-muted">—</span>
                                  )}
                                </td>
                                <td>
                            <span className={`status-badge ${shop.shopStatus?.toLowerCase()}`}>
                              {shop.shopStatus}
                            </span>
                                </td>
                                <td>
                                  <div className="rating-cell">
                                    <i className="fa-solid fa-star text-amber"></i>
                                    <span>{shop.rating?.toFixed(1) ?? "0.0"}</span>
                                  </div>
                                </td>
                                <td>{shop.totalProducts ?? 0}</td>
                                <td>${shop.totalIncome?.toFixed(2) ?? "0.00"}</td>
                                <td>{shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : "—"}</td>
                                <td>
                                  <button
                                      onClick={() => openModal(shop, "shop")}
                                      className="btn-info-col"
                                      title="View Details"
                                  >
                                    <i className="fa-solid fa-circle-info"></i>
                                  </button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </>
                    )}
                  </table>
                </div>
            )}
          </div>

          <footer className="modern-pagination">
            <div className="pagination-controls">
              <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="pag-btn">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div className="page-indicator">
                <span className="current-page">{totalPages === 0 ? 0 : currentPage + 1}</span>
                <span className="divider">/</span>
                <span className="total-pages">{totalPages}</span>
              </div>
              <button
                  disabled={currentPage >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage(currentPage + 1)}
                  className="pag-btn"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            <div className="pagination-progress">
              <div
                  className="progress-bar-fill"
                  style={{ width: totalPages > 0 ? `${((currentPage + 1) / totalPages) * 100}%` : "0%" }}
              ></div>
            </div>
          </footer>
        </main>

        {modalItem && <AdminDetailModal item={modalItem} type={modalType} onClose={closeModal} />}
        {rejectTask && (
            <RejectModal
                task={rejectTask}
                onConfirm={handleRejectConfirm}
                onCancel={() => setRejectTask(null)}
                loading={rejectLoading}
            />
        )}
      </div>
  );
};

export default AdminDashboard;