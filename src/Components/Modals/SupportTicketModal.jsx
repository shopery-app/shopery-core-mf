import React, { useState, useEffect } from "react";

const MODAL_STYLE_ID     = "stm-page-styles";
const MODAL_FONT_LINK_ID = "settings-google-fonts"; // same font link, reuse if already present

function injectModalStyles() {
    if (document.getElementById(MODAL_STYLE_ID)) return;

    if (!document.getElementById(MODAL_FONT_LINK_ID)) {
        const link = document.createElement("link");
        link.id   = MODAL_FONT_LINK_ID;
        link.rel  = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
        document.head.appendChild(link);
    }

    const style = document.createElement("style");
    style.id = MODAL_STYLE_ID;
    style.textContent = `
    .stm-overlay {
      position: fixed; inset: 0; z-index: 9998;
      display: flex; align-items: center; justify-content: center; padding: 16px;
      background: rgba(26,23,20,0.52);
      backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
      animation: stm-fade 0.2s ease both;
    }
    @keyframes stm-fade { from { opacity: 0; } to { opacity: 1; } }

    .stm-panel {
      background: #fff; border-radius: 18px;
      width: 100%; max-width: 460px;
      box-shadow: 0 20px 56px rgba(26,23,20,0.18);
      overflow: hidden;
      animation: stm-up 0.24s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes stm-up {
      from { opacity: 0; transform: translateY(16px) scale(.98); }
      to   { opacity: 1; transform: translateY(0)    scale(1);   }
    }

    .stm-header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid #EBE8E2;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .stm-badge {
      font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: 0.11em; text-transform: uppercase; color: #2A6B4F;
      background: #E8F3EE; padding: 3px 9px; border-radius: 100px;
      margin-bottom: 8px; display: inline-block;
    }
    .stm-title {
      font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
      color: #1A1714; margin: 0; letter-spacing: -0.015em; line-height: 1.25;
    }
    .stm-close {
      width: 34px; height: 34px; border-radius: 8px;
      border: 1px solid #E4E0D8; background: #F7F5F0;
      cursor: pointer; color: #A09B96; font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.14s; flex-shrink: 0; margin-top: 1px;
    }
    .stm-close:hover { background: #1A1714; color: #fff; border-color: #1A1714; }

    .stm-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 20px; }

    .stm-label {
      font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase; color: #A09B96;
      margin-bottom: 7px; display: block;
    }
    .stm-counter { font-weight: 400; color: #C8C4BE; margin-left: 5px; }

    .stm-input, .stm-textarea {
      width: 100%; padding: 12px 15px;
      border: 1.5px solid #E4E0D8; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
      color: #1A1714; background: #FAFAF8; outline: none; resize: none;
      transition: border-color 0.14s, box-shadow 0.14s, background 0.14s;
    }
    .stm-input::placeholder, .stm-textarea::placeholder { color: #C8C4BE; }
    .stm-input:focus, .stm-textarea:focus {
      border-color: #2A6B4F; background: #fff;
      box-shadow: 0 0 0 3px rgba(42,107,79,0.09);
    }
    .stm-input.err, .stm-textarea.err { border-color: #C0392B; }
    .stm-input.err:focus, .stm-textarea.err:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.09); }
    .stm-err { font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 500; color: #C0392B; margin-top: 5px; }

    .stm-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .stm-btn-cancel {
      padding: 12px; border: 1.5px solid #E4E0D8; border-radius: 10px;
      background: transparent; color: #6B6660;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
      cursor: pointer; transition: all 0.13s;
    }
    .stm-btn-cancel:hover { background: #F7F5F0; color: #1A1714; }

    .stm-btn-submit {
      padding: 12px; border: none; border-radius: 10px;
      background: #1A1714; color: #fff;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
      letter-spacing: 0.01em; cursor: pointer;
      transition: background 0.13s, transform 0.13s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      box-shadow: 0 4px 12px rgba(26,23,20,0.16);
    }
    .stm-btn-submit:hover:not(:disabled) { background: #2E2B28; transform: translateY(-1px); }
    .stm-btn-submit:active  { transform: translateY(0); }
    .stm-btn-submit:disabled { opacity: 0.48; cursor: not-allowed; transform: none; }
  `;
    document.head.appendChild(style);
}

const SupportTicketModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
    const [formData, setFormData] = useState({ subject: "", description: "" });
    const [errors,   setErrors  ] = useState({});

    useEffect(() => { injectModalStyles(); }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({ subject: initialData.subject, description: initialData.description });
        } else {
            setFormData({ subject: "", description: "" });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validate = () => {
        const e = {};
        if (formData.subject.length < 3 || formData.subject.length > 40)
            e.subject = "Subject must be 3–40 characters.";
        if (!formData.description)
            e.description = "Description is required.";
        else if (formData.description.length > 2000)
            e.description = "Description cannot exceed 2000 characters.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(formData);
    };

    if (!isOpen) return null;

    const isEdit = Boolean(initialData);

    return (
        <div className="stm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="stm-panel">

                <div className="stm-header">
                    <div>
                        <div className="stm-badge">{isEdit ? "Editing" : "New request"}</div>
                        <h3 className="stm-title">{isEdit ? "Update Ticket" : "Open a Support Ticket"}</h3>
                    </div>
                    <button className="stm-close" onClick={onClose} aria-label="Close">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="stm-body">
                    <div>
                        <label className="stm-label">
                            Subject
                            <span className="stm-counter">{formData.subject.length}/40</span>
                        </label>
                        <input
                            type="text"
                            className={`stm-input${errors.subject ? " err" : ""}`}
                            placeholder="Brief summary of your issue"
                            value={formData.subject}
                            maxLength={40}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                        {errors.subject && <div className="stm-err">{errors.subject}</div>}
                    </div>

                    <div>
                        <label className="stm-label">
                            Description
                            <span className="stm-counter">{formData.description.length}/2000</span>
                        </label>
                        <textarea
                            rows={5}
                            className={`stm-textarea${errors.description ? " err" : ""}`}
                            placeholder="Describe the problem or request in detail…"
                            value={formData.description}
                            maxLength={2000}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        {errors.description && <div className="stm-err">{errors.description}</div>}
                    </div>

                    <div className="stm-footer">
                        <button type="button" className="stm-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="stm-btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 12 }} />
                                    Processing…
                                </>
                            ) : (
                                isEdit ? "Save Changes" : "Submit Ticket"
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default SupportTicketModal;