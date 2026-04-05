import React, { useState, useEffect, useReducer, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { apiURL } from "../../Backend/Api/api";
import axios from "axios";
import SupportTicketModal from "../Modals/SupportTicketModal";

const initialState = { fullName: "", birthDate: "" };

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_ALL": return { ...state, ...action.payload };
    default: return state;
  }
};

const NAV_ITEMS = [
  { id: "profile",  label: "Profile",  sub: "Personal details", icon: "fa-user-circle" },
  { id: "support",  label: "Support",  sub: "Tickets & help",   icon: "fa-headset" },
  { id: "security", label: "Security", sub: "Privacy & access", icon: "fa-shield-halved" },
];

// Injected once — never re-runs on re-render, never pollutes global styles
const STYLE_ID     = "settings-page-styles";
const FONT_LINK_ID = "settings-google-fonts";

function injectSettingsStyles() {
  if (document.getElementById(STYLE_ID)) return;

  // Google Fonts via <link> — the correct way, never inside a <style> tag
  if (!document.getElementById(FONT_LINK_ID)) {
    const link = document.createElement("link");
    link.id   = FONT_LINK_ID;
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }

  // All CSS variables scoped under .settings-root — never touches :root or Header/Footer
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .settings-root {
      --s-bg:        #F7F5F0;
      --s-surface:   #FFFFFF;
      --s-surface-2: #F2EFE9;
      --s-border:    #E4E0D8;
      --s-ink:       #1A1714;
      --s-ink-2:     #6B6660;
      --s-ink-3:     #A09B96;
      --s-accent:    #2A6B4F;
      --s-accent-bg: #E8F3EE;
      --s-accent-hi: #3D9970;
      --s-danger:    #C0392B;
      --s-danger-bg: #FDECEA;
      background: var(--s-bg);
      min-height: 100vh;
    }

    /* Spinner */
    .s-spinner {
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid #E4E0D8; border-top-color: #2A6B4F;
      animation: s-spin 0.7s linear infinite;
    }
    @keyframes s-spin { to { transform: rotate(360deg); } }

    /* Toast */
    .s-toast {
      position: fixed; top: 88px; right: 24px; z-index: 9999;
      background: #1A1714; color: #fff;
      padding: 12px 18px; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
      display: flex; align-items: center; gap: 9px;
      box-shadow: 0 8px 28px rgba(26,23,20,0.20);
      animation: s-toast-in 0.26s cubic-bezier(.22,1,.36,1) both;
      pointer-events: none;
    }
    .s-toast-dot { width: 6px; height: 6px; border-radius: 50%; background: #3D9970; flex-shrink: 0; }
    @keyframes s-toast-in {
      from { opacity: 0; transform: translateY(-6px) scale(.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Card */
    .s-card {
      background: #fff; border: 1px solid #E4E0D8;
      border-radius: 16px; box-shadow: 0 2px 10px rgba(26,23,20,0.05);
    }

    /* Sidebar nav */
    .s-nav-btn {
      width: 100%; display: flex; align-items: center; gap: 11px;
      padding: 11px 13px; border-radius: 9px;
      border: none; background: transparent; cursor: pointer;
      transition: background 0.14s, color 0.14s; color: #6B6660; text-align: left;
    }
    .s-nav-btn:hover:not(.s-nav-active) { background: #F2EFE9; color: #1A1714; }
    .s-nav-btn.s-nav-active             { background: #1A1714; color: #fff; }
    .s-nav-icon {
      width: 32px; height: 32px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      background: #F2EFE9; color: #6B6660; flex-shrink: 0; font-size: 13px;
      transition: background 0.14s, color 0.14s;
    }
    .s-nav-btn.s-nav-active .s-nav-icon { background: rgba(255,255,255,0.13); color: #fff; }
    .s-nav-label {
      font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px;
      line-height: 1.2; color: inherit;
    }
    .s-nav-sub {
      font-family: 'DM Sans', sans-serif; font-size: 11px;
      font-weight: 400; opacity: 0.55; margin-top: 1px;
    }

    /* Accent bar */
    .s-accent-bar { width: 32px; height: 3px; border-radius: 2px; background: #2A6B4F; margin-bottom: 18px; }

    /* Profile fields */
    .s-field-label {
      font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 600;
      letter-spacing: 0.10em; text-transform: uppercase; color: #A09B96; margin-bottom: 7px;
    }
    .s-field-value {
      font-family: 'DM Sans', sans-serif; background: #F7F5F0; border: 1px solid #E4E0D8;
      border-radius: 9px; padding: 12px 15px; font-size: 14px; font-weight: 500; color: #1A1714;
    }

    /* New ticket button */
    .s-new-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #1A1714; color: #fff; padding: 10px 18px;
      border-radius: 9px; border: none;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background 0.14s, transform 0.14s;
      box-shadow: 0 4px 12px rgba(26,23,20,0.16); letter-spacing: 0.01em;
    }
    .s-new-btn:hover  { background: #2E2B28; transform: translateY(-1px); }
    .s-new-btn:active { transform: translateY(0); }

    /* Ticket card */
    .s-ticket {
      background: #fff; border: 1px solid #E4E0D8;
      border-radius: 13px; padding: 20px 22px;
      transition: box-shadow 0.16s, transform 0.16s;
      position: relative; overflow: hidden;
    }
    .s-ticket::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; border-radius: 1.5px 0 0 1.5px;
    }
    .s-ticket.s-open::before   { background: #2A6B4F; }
    .s-ticket.s-closed::before { background: #C8C4BE; }
    .s-ticket:hover { box-shadow: 0 6px 24px rgba(26,23,20,0.09); transform: translateY(-1px); }

    .s-ticket-actions {
      display: flex; gap: 6px;
      opacity: 0; transform: translateX(5px);
      transition: opacity 0.14s, transform 0.14s;
    }
    .s-ticket:hover .s-ticket-actions { opacity: 1; transform: translateX(0); }

    .s-ticket-btn {
      width: 34px; height: 34px; border-radius: 7px;
      border: 1px solid #E4E0D8; background: #F7F5F0; color: #A09B96;
      cursor: pointer; font-size: 12px;
      display: flex; align-items: center; justify-content: center; transition: all 0.13s;
    }
    .s-ticket-btn.edit:hover   { background: #E8F3EE; color: #2A6B4F; border-color: #3D9970; }
    .s-ticket-btn.delete:hover { background: #FDECEA; color: #C0392B; border-color: #C0392B; }

    /* Status badge */
    .s-status {
      display: inline-flex; align-items: center; gap: 5px;
      font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase;
      padding: 4px 9px; border-radius: 100px;
    }
    .s-status.open   { background: #E8F3EE; color: #2A6B4F; }
    .s-status.closed { background: #F2EFE9; color: #A09B96; }
    .s-status-dot    { width: 5px; height: 5px; border-radius: 50%; }
    .s-status.open   .s-status-dot { background: #2ECC71; }
    .s-status.closed .s-status-dot { background: #BDB9B4; }

    /* Empty state */
    .s-empty-icon {
      width: 54px; height: 54px; border-radius: 13px;
      background: #E8F3EE; color: #2A6B4F; font-size: 22px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
  `;
  document.head.appendChild(style);
}

const Settings = () => {
  const [currentUser, setCurrentUser]           = useState(null);
  const [activeSection, setActiveSection]       = useState("profile");
  const [formState, dispatch]                   = useReducer(formReducer, initialState);
  const [loading, setLoading]                   = useState(true);
  const [successMsg, setSuccessMsg]             = useState("");
  const [tickets, setTickets]                   = useState([]);
  const [ticketsLoading, setTicketsLoading]     = useState(false);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [selectedTicket, setSelectedTicket]     = useState(null);
  const [ticketSubmitLoading, setTicketSubmitLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { injectSettingsStyles(); }, []);

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-Type": "application/json",
  }), []);

  const handleGetUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await axios.get(`${apiURL}/users/me/profile`, { headers: getAuthHeaders() });
      const user = res.data?.data ?? res.data;
      if (user) {
        setCurrentUser(user);
        dispatch({
          type: "SET_ALL",
          payload: {
            fullName:  [user.firstName, user.lastName].filter(Boolean).join(" "),
            birthDate: user.dateOfBirth
                ? new Date(user.dateOfBirth).toISOString().split("T")[0]
                : "",
          },
        });
      }
    } catch (e) {
      if (e.response?.status === 401) navigate("/signin");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, navigate]);

  const fetchTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      const res  = await axios.get(`${apiURL}/users/me/support-tickets`, { headers: getAuthHeaders() });
      const data = res.data?.data?.content || res.data?.data || [];
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setTicketsLoading(false);
    }
  }, [getAuthHeaders]);

  const handleTicketSubmit = async (formData) => {
    setTicketSubmitLoading(true);
    try {
      if (selectedTicket) {
        await axios.put(`${apiURL}/users/me/support-tickets/${selectedTicket.id}`, formData, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${apiURL}/users/me/support-tickets`, formData, { headers: getAuthHeaders() });
      }
      setSuccessMsg(selectedTicket ? "Ticket updated" : "Ticket submitted");
      setIsModalOpen(false);
      fetchTickets();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setTicketSubmitLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    try {
      await axios.delete(`${apiURL}/users/me/support-tickets/${id}`, { headers: getAuthHeaders() });
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setSuccessMsg("Ticket removed");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      alert("Delete failed");
    }
  };

  useEffect(() => { handleGetUserProfile(); }, [handleGetUserProfile]);
  useEffect(() => { if (activeSection === "support") fetchTickets(); }, [activeSection, fetchTickets]);

  if (loading) return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F0" }}>
          <div className="s-spinner" />
        </div>
        <Footer />
      </div>
  );

  return (
      <div className="settings-root">
        <Header />

        {successMsg && (
            <div className="s-toast">
              <span className="s-toast-dot" />
              {successMsg}
            </div>
        )}

        <main style={{ maxWidth: 1140, margin: "0 auto", padding: "104px 24px 80px", minHeight: "82vh" }}>

          {/* Page title */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A09B96", marginBottom: 7, margin: "0 0 7px" }}>
              Account
            </p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, color: "#1A1714", margin: 0, letterSpacing: "-0.015em", lineHeight: 1.18 }}>
              Settings
            </h1>
          </div>

          <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Sidebar */}
            <aside style={{ width: 216, flexShrink: 0 }}>
              <div className="s-card" style={{ padding: 5, position: "sticky", top: 90 }}>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`s-nav-btn${activeSection === item.id ? " s-nav-active" : ""}`}
                    >
                  <span className="s-nav-icon">
                    <i className={`fa-solid ${item.icon}`} />
                  </span>
                      <span>
                    <div className="s-nav-label">{item.label}</div>
                    <div className="s-nav-sub">{item.sub}</div>
                  </span>
                    </button>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* ── Profile ── */}
              {activeSection === "profile" && (
                  <div className="s-card" style={{ padding: "30px 34px" }}>
                    <div className="s-accent-bar" />
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 600, color: "#1A1714", margin: "0 0 22px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                      Personal Details
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 18 }}>
                      {[
                        { label: "Full Name",     value: formState.fullName || "Not provided" },
                        { label: "Email Address", value: currentUser?.email },
                      ].map((f) => (
                          <div key={f.label}>
                            <div className="s-field-label">{f.label}</div>
                            <div className="s-field-value">{f.value}</div>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* ── Support ── */}
              {activeSection === "support" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="s-card" style={{ padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                      <div>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 600, color: "#1A1714", margin: "0 0 3px", letterSpacing: "-0.01em" }}>
                          Support Tickets
                        </h2>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#A09B96", fontFamily: "'DM Sans', sans-serif" }}>
                          {tickets.length > 0 ? `${tickets.length} ticket${tickets.length > 1 ? "s" : ""}` : "No open tickets"}
                        </p>
                      </div>
                      <button className="s-new-btn" onClick={() => { setSelectedTicket(null); setIsModalOpen(true); }}>
                        <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                        New Ticket
                      </button>
                    </div>

                    {ticketsLoading ? (
                        <div className="s-card" style={{ padding: 64, display: "flex", justifyContent: "center" }}>
                          <div className="s-spinner" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="s-card" style={{ padding: "52px 24px", textAlign: "center" }}>
                          <div className="s-empty-icon"><i className="fa-solid fa-inbox" /></div>
                          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, color: "#1A1714", margin: "0 0 6px" }}>
                            All clear
                          </h3>
                          <p style={{ fontSize: 13, color: "#A09B96", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                            No active requests. Open a new ticket above.
                          </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                          {tickets.map((t) => {
                            const isOpen = t.status === "OPEN";
                            return (
                                <div key={t.id} className={`s-ticket ${isOpen ? "s-open" : "s-closed"}`}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9, flexWrap: "wrap" }}>
                                <span className={`s-status ${isOpen ? "open" : "closed"}`}>
                                  <span className="s-status-dot" />
                                  {t.status}
                                </span>
                                        <span style={{ fontSize: 11.5, color: "#A09B96", fontFamily: "'DM Sans', sans-serif" }}>
                                  {new Date(t.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                                      </div>
                                      <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600, color: "#1A1714", margin: "0 0 5px", letterSpacing: "-0.01em" }}>
                                        {t.subject}
                                      </h4>
                                      <p style={{ fontSize: 13, color: "#6B6660", margin: 0, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                                        {t.description}
                                      </p>
                                    </div>
                                    <div className="s-ticket-actions">
                                      <button className="s-ticket-btn edit" title="Edit" onClick={() => { setSelectedTicket(t); setIsModalOpen(true); }}>
                                        <i className="fa-solid fa-pen-to-square" />
                                      </button>
                                      <button className="s-ticket-btn delete" title="Delete" onClick={() => handleDeleteTicket(t.id)}>
                                        <i className="fa-solid fa-trash-can" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                    )}
                  </div>
              )}

              {/* ── Security ── */}
              {activeSection === "security" && (
                  <div className="s-card" style={{ padding: "68px 24px", textAlign: "center" }}>
                    <div style={{ width: 54, height: 54, borderRadius: 13, background: "#F2EFE9", color: "#A09B96", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px" }}>
                      <i className="fa-solid fa-lock" />
                    </div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, color: "#1A1714", margin: "0 0 6px" }}>
                      Coming Soon
                    </h3>
                    <p style={{ fontSize: 13, color: "#A09B96", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                      Security and privacy controls are on the way.
                    </p>
                  </div>
              )}

            </div>
          </div>
        </main>

        <SupportTicketModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleTicketSubmit}
            initialData={selectedTicket}
            loading={ticketSubmitLoading}
        />

        <Footer />
      </div>
  );
};

export default Settings;