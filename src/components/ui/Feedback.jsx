import clsx from "clsx";
import { SpinnerIcon, BoxIcon } from "./icons";

export const Spinner = ({ size = 22, className = "" }) => (
  <SpinnerIcon size={size} className={clsx("text-ink-muted", className)} />
);

export const PageSpinner = ({ label = "Loading…" }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
    <Spinner size={26} />
    <p className="text-[13px] text-ink-muted">{label}</p>
  </div>
);

export const EmptyState = ({ icon: IconCmp = BoxIcon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-ink-muted">
      <IconCmp size={22} />
    </div>
    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-[13.5px] text-ink-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorState = ({ title = "Something went wrong", description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-danger-subtle px-6 py-14 text-center">
    <h3 className="text-[15px] font-semibold text-danger">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-[13.5px] text-ink-secondary">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={clsx("animate-pulse rounded-md bg-surface-sunken", className)} />
);
