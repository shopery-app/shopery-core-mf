import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, CloseIcon } from "./icons";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

const TONE = {
  success: { icon: CheckCircleIcon, cls: "border-success/20 bg-success-subtle text-success" },
  error: { icon: AlertCircleIcon, cls: "border-danger/20 bg-danger-subtle text-danger" },
  info: { icon: InfoIcon, cls: "border-info/20 bg-info-subtle text-info" },
};

let uid = 0;

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++uid;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3200);
    },
    [remove],
  );

  const value = useMemo(() => ({ showToast, removeToast: remove }), [showToast, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[2000] flex flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, cls } = TONE[t.type] || TONE.success;
          return (
            <div
              key={t.id}
              className={`animate-toast-in flex min-w-[280px] max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 shadow-popover ${cls}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-[13px] font-medium leading-snug">{t.message}</p>
              <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 hover:opacity-100">
                <CloseIcon size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
