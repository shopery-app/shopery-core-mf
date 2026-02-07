import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import { apiURL } from "../../Backend/Api/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [taskFilter, setTaskFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab, page, taskFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminAccessToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          page, 
          size: 10,
          taskCategory: activeTab === 'tasks' && taskFilter ? taskFilter : undefined
        }
      };

      let response;
      if (activeTab === 'customers') {
        response = await axios.get(`${apiURL}/admin/customers`, config);
        setCustomers(response.data.data.content);
      } else if (activeTab === 'merchants') {
        response = await axios.get(`${apiURL}/admin/merchants`, config);
        setMerchants(response.data.data.content);
      } else if (activeTab === 'tasks') {
        response = await axios.get(`${apiURL}/admin/tasks`, config);
        setTasks(response.data.data.content);
      }
      
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admins');
  };

  const handleAction = async (url, method = 'post', body = {}) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      await axios[method](`${apiURL}${url}`, body, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      alert("Action failed. Check console.");
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="glass-nav">
        <div className="nav-container">
          <div className="logo-section">
            <div className="logo-icon">S</div>
            <span className="logo-text">Shopery<span>Admin</span></span>
          </div>
          <button onClick={handleLogout} className="logout-pill">
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="stats-grid">
          <div className="stat-card indigo">
            <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
            <div className="stat-info"><h3>Total Users</h3><p>{customers.length + merchants.length}+</p></div>
          </div>
          <div className="stat-card emerald">
            <div className="stat-icon"><i className="fa-solid fa-store"></i></div>
            <div className="stat-info"><h3>Active Shops</h3><p>{merchants.length}</p></div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon"><i className="fa-solid fa-list-check"></i></div>
            <div className="stat-info"><h3>Pending Tasks</h3><p>{tasks.filter(t => t.requestStatus === 'PENDING').length}</p></div>
          </div>
        </section>

        <div className="control-bar glass-card">
          <div className="pill-tabs">
            <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => {setActiveTab('customers'); setPage(0);}}>Customers</button>
            <button className={activeTab === 'merchants' ? 'active' : ''} onClick={() => {setActiveTab('merchants'); setPage(0);}}>Merchants</button>
            <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => {setActiveTab('tasks'); setPage(0);}}>Tasks</button>
          </div>

          {activeTab === 'tasks' && (
            <div className="sub-pill-filter">
              <button className={taskFilter === '' ? 'active' : ''} onClick={() => setTaskFilter('')}>All</button>
              <button className={taskFilter === 'SHOP_CREATION_REQUEST' ? 'active' : ''} onClick={() => setTaskFilter('SHOP_CREATION_REQUEST')}><i className="fa-solid fa-store"></i> Shop Requests</button>
              <button className={taskFilter === 'SUPPORT_TICKET' ? 'active' : ''} onClick={() => setTaskFilter('SUPPORT_TICKET')}><i className="fa-solid fa-headset"></i> Support Tickets</button>
            </div>
          )}
        </div>

        <div className="data-container glass-card">
          {loading ? (
            <div className="modern-loader"><div></div></div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  {activeTab === 'tasks' ? (
                    <tr><th>Type</th><th>Created By</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                  ) : (
                    <tr><th>User</th><th>Contact</th><th>Joined</th>{activeTab === 'merchants' && <th>Security</th>}</tr>
                  )}
                </thead>
                <tbody>
                  {activeTab === 'customers' && customers.map(c => (
                    <tr key={c.email}>
                      <td><div className="user-cell"><div className="avatar">{c.firstName[0]}</div><div><strong>{c.firstName} {c.lastName}</strong><p>{c.email}</p></div></div></td>
                      <td>{c.phone}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {activeTab === 'merchants' && merchants.map(m => (
                    <tr key={m.email}>
                      <td><div className="user-cell"><div className="avatar merchant-av">{m.firstName[0]}</div><div><strong>{m.firstName} {m.lastName}</strong><p>{m.email}</p></div></div></td>
                      <td>{m.phone}</td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td><button onClick={() => handleAction('/admin/users/close', 'patch', {email: m.email})} className="btn-icon danger"><i className="fa-solid fa-user-slash"></i> Close</button></td>
                    </tr>
                  ))}
                  {activeTab === 'tasks' && tasks.map(t => (
                    <tr key={t.id}>
                      <td><span className="type-badge">{t.taskCategory.replace('_', ' ')}</span></td>
                      <td>{t.taskCreatorDto?.email}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-pill ${t.requestStatus || t.ticketStatus}`}>{t.requestStatus || t.ticketStatus}</span></td>
                      <td>
                        {t.requestStatus === 'PENDING' && (
                          <div className="action-group">
                            <button onClick={() => handleAction(`/admin/tasks/${t.id}/approve`)} className="btn-circle success" title="Approve"><i className="fa-solid fa-check"></i></button>
                            <button onClick={() => {const r = window.prompt("Reason for rejection?"); if(r) handleAction(`/admin/tasks/${t.id}/reject`, 'post', {rejectionReason: r})}} className="btn-circle danger" title="Reject"><i className="fa-solid fa-xmark"></i></button>
                          </div>
                        )}
                        {t.ticketStatus === 'OPEN' && (
                          <button onClick={() => handleAction(`/admin/tasks/${t.id}/close`, 'patch')} className="btn-resolve"><i className="fa-solid fa-check-double"></i>Mark Resolved</button>
                        )}

                        {((t.requestStatus && t.requestStatus !== 'PENDING') || (t.ticketStatus && t.ticketStatus !== 'OPEN')) && (
                          <div className="completed-stamp"><i className="fa-solid fa-circle-check"></i><span>Archived</span></div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="modern-pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}><i className="fa-solid fa-chevron-left"></i></button>
          <span>Page <strong>{page + 1}</strong> of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><i className="fa-solid fa-chevron-right"></i></button>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;