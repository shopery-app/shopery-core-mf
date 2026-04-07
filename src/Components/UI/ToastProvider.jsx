import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
};

let toastId = 0;

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = "success") => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, [removeToast]);

    const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

    const icons = {
        error: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        warning: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14.5 13H1.5L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 7v2.5M8 11.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        success: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    };

    const styles = {
        error: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
        warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
        success: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div style={{
                position: "fixed", top: "24px", right: "24px",
                zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px"
            }}>
                {toasts.map((toast) => {
                    const s = styles[toast.type] || styles.success;
                    return (
                        <div
                            key={toast.id}
                            style={{
                                minWidth: "280px", maxWidth: "380px",
                                background: s.bg,
                                border: `1px solid ${s.border}`,
                                borderRadius: "12px",
                                padding: "14px 16px",
                                display: "flex", alignItems: "flex-start",
                                justifyContent: "space-between", gap: "12px",
                                animation: "toastIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                fontFamily: "'Instrument Sans', sans-serif",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: s.text }}>
                                {icons[toast.type]}
                                <span style={{ fontSize: "13.5px", fontWeight: 500, color: s.text, lineHeight: 1.4 }}>
                                    {toast.message}
                                </span>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: s.text, opacity: 0.5, padding: "2px", flexShrink: 0,
                                    display: "flex", alignItems: "center",
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(16px) scale(0.97); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export default ToastProvider;