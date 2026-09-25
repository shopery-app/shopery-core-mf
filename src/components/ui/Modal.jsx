import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { CloseIcon } from "./icons";
import IconButton from "./IconButton";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const Modal = ({ open, onClose, title, size = "md", children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "relative w-full rounded-lg border border-border bg-surface shadow-popover max-h-[88vh] flex flex-col",
          SIZES[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            <IconButton size="sm" variant="ghost" onClick={onClose} aria-label="Close">
              <CloseIcon size={16} />
            </IconButton>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
