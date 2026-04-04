import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
import { apiURL } from "../../Backend/Api/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [taskFilter, setTaskFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab, page, taskFilter]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("adminAccessToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      let response;

      if (activeTab === "users") {
        response = await axios.get(`${apiURL}/admins/users`, {
          ...getAuthConfig(),
          params: {
            page,
            size: 10,
          },
        });

        const pageData = response?.data?.data;
        setUsers(pageData?.content || []);
        setTotalPages(pageData?.page?.totalPages || pageData?.totalPages || 0);
      }

      if (activeTab === "tasks") {
        response = await axios.get(`${apiURL}/admins/tasks`, {
          ...getAuthConfig(),
          params: {
            page,
            size: 10,
            taskCategory: taskFilter || undefined,
          },
        });

        const pageData = response?.data?.data;
        setTasks(pageData?.content || []);
        setTotalPages(pageData?.page?.totalPages || pageData?.totalPages || 0);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      } else {
        console.error("Fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admins");
  };

  const handleCloseUser = async (userId) => {
    try {
      await axios.patch(
          `${apiURL}/admins/users/${userId}/close`,
          {},
          getAuthConfig()
      );
      fetchData();
    } catch (error) {
      console.error("Close user failed:", error);
      alert("Close user failed.");
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      await axios.post(
          `${apiURL}/admins/tasks/${taskId}/approve`,
          {},
          getAuthConfig()
      );
      fetchData();
    } catch (error) {
      console.error("Approve failed:", error);
      alert("Approve failed.");
    }
  };

  const handleRejectTask = async (taskId) => {
    const rejectionReason = window.prompt("Reason for rejection?");
    if (!rejectionReason) return;

    try {
      await axios.post(
          `${apiURL}/admins/tasks/${taskId}/reject`,
          { rejectionReason },
          getAuthConfig()
      );
      fetchData();
    } catch (error) {
      console.error("Reject failed:", error);
      alert("Reject failed.");
    }
  };

  const handleCloseTask = async (taskId) => {
    try {
      await axios.patch(
          `${apiURL}/admins/tasks/${taskId}/close`,
          {},
          getAuthConfig()
      );
      fetchData();
    } catch (error) {
      console.error("Close task failed:", error);
      alert("Close task failed.");
    }
  };

  const renderTaskActions = (task) => {
    if (task.taskCategory === "SHOP_CREATION_REQUEST") {
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
                onClick={() => handleRejectTask(task.id)}
                className="btn-circle danger"
                title="Reject"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
      );
    }

    if (task.taskCategory === "SUPPORT_TICKET") {
      return (
          <button
              onClick={() => handleCloseTask(task.id)}
              className="btn-resolve"
          >
            <i className="fa-solid fa-check-double"></i> Mark Resolved
          </button>
      );
    }

    return <span>-</span>;
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

            <button onClick={handleLogout} className="logout-pill">
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
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
                <i className="fa-solid fa-list-check"></i>
              </div>
              <div className="stat-info">
                <h3>Total Tasks</h3>
                <p>{tasks.length}</p>
              </div>
            </div>

            <div className="stat-card amber">
              <div className="stat-icon">
                <i className="fa-solid fa-filter"></i>
              </div>
              <div className="stat-info">
                <h3>Filtered Tasks</h3>
                <p>{taskFilter ? tasks.length : "All"}</p>
              </div>
            </div>
          </section>

          <div className="control-bar glass-card">
            <div className="pill-tabs">
              <button
                  className={activeTab === "users" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("users");
                    setPage(0);
                  }}
              >
                Users
              </button>

              <button
                  className={activeTab === "tasks" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("tasks");
                    setPage(0);
                  }}
              >
                Tasks
              </button>
            </div>

            {activeTab === "tasks" && (
                <div className="sub-pill-filter">
                  <button
                      className={taskFilter === "" ? "active" : ""}
                      onClick={() => {
                        setTaskFilter("");
                        setPage(0);
                      }}
                  >
                    All
                  </button>
                  <button
                      className={taskFilter === "SHOP_CREATION_REQUEST" ? "active" : ""}
                      onClick={() => {
                        setTaskFilter("SHOP_CREATION_REQUEST");
                        setPage(0);
                      }}
                  >
                    <i className="fa-solid fa-store"></i> Shop Requests
                  </button>
                  <button
                      className={taskFilter === "SUPPORT_TICKET" ? "active" : ""}
                      onClick={() => {
                        setTaskFilter("SUPPORT_TICKET");
                        setPage(0);
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
                    <thead>
                    {activeTab === "users" ? (
                        <tr>
                          <th>User</th>
                          <th>Contact</th>
                          <th>Date of Birth</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                    ) : (
                        <tr>
                          <th>Type</th>
                          <th>Created By</th>
                          <th>Created At</th>
                          <th>Updated At</th>
                          <th>Actions</th>
                        </tr>
                    )}
                    </thead>

                    <tbody>
                    {activeTab === "users" &&
                        users.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="user-cell">
                                  <div className="avatar">
                                    {user.profilePhotoUrl ? (
                                        <img
                                            src={user.profilePhotoUrl}
                                            alt={user.firstName}
                                            className="avatar-img"
                                        />
                                    ) : (
                                        user.firstName?.[0] || "U"
                                    )}
                                  </div>
                                  <div>
                                    <strong>
                                      {user.firstName} {user.lastName}
                                    </strong>
                                    <p>{user.email}</p>
                                    <small>ID: {user.id}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{user.phone || "-"}</td>
                              <td>
                                {user.dateOfBirth
                                    ? new Date(user.dateOfBirth).toLocaleDateString()
                                    : "-"}
                              </td>
                              <td>
                                {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "-"}
                              </td>
                              <td>
                                <button
                                    onClick={() => handleCloseUser(user.id)}
                                    className="btn-icon danger"
                                >
                                  <i className="fa-solid fa-user-slash"></i> Close
                                </button>
                              </td>
                            </tr>
                        ))}

                    {activeTab === "tasks" &&
                        tasks.map((task) => (
                            <tr key={task.id}>
                              <td>
                          <span className="type-badge">
                            {task.taskCategory?.replaceAll("_", " ")}
                          </span>
                              </td>
                              <td>{task.taskCreatorDto?.email || "-"}</td>
                              <td>
                                {task.createdAt
                                    ? new Date(task.createdAt).toLocaleDateString()
                                    : "-"}
                              </td>
                              <td>
                                {task.updatedAt
                                    ? new Date(task.updatedAt).toLocaleDateString()
                                    : "-"}
                              </td>
                              <td>{renderTaskActions(task)}</td>
                            </tr>
                        ))}

                    {!loading && activeTab === "users" && users.length === 0 && (
                        <tr>
                          <td colSpan="5">No users found.</td>
                        </tr>
                    )}

                    {!loading && activeTab === "tasks" && tasks.length === 0 && (
                        <tr>
                          <td colSpan="5">No tasks found.</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
            )}
          </div>

          <footer className="modern-pagination">
            <div className="pagination-controls">
              <button
                  disabled={page === 0}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="pag-btn"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <div className="page-indicator">
                <span className="current-page">{totalPages === 0 ? 0 : page + 1}</span>
                <span className="divider">/</span>
                <span className="total-pages">{totalPages}</span>
              </div>

              <button
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="pag-btn"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <div className="pagination-progress">
              <div
                  className="progress-bar-fill"
                  style={{
                    width:
                        totalPages > 0 ? `${((page + 1) / totalPages) * 100}%` : "0%",
                  }}
              ></div>
            </div>
          </footer>
        </main>
      </div>
  );
};

export default AdminDashboard;