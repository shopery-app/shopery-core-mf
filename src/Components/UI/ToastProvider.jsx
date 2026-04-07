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
        setTimeout(() => removeToast(id), 2800);
    }, [removeToast]);

    const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="fixed top-5 right-5 z-[200] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`min-w-[260px] max-w-[360px] px-4 py-4 rounded-2xl shadow-xl border text-sm font-semibold animate-[fadeIn_.2s_ease] ${
                            toast.type === "error"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : toast.type === "warning"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <i
                                    className={`${
                                        toast.type === "error"
                                            ? "fa-solid fa-circle-exclamation"
                                            : toast.type === "warning"
                                                ? "fa-solid fa-triangle-exclamation"
                                                : "fa-solid fa-circle-check"
                                    }`}
                                />
                                <span>{toast.message}</span>
                            </div>

                            <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

export default ToastProvider;