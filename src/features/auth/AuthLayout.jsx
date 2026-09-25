import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "../../components/ui/icons";

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
    <div className="w-full max-w-[400px]">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-ink-inverse">S</span>
          <span className="text-lg font-semibold text-ink">Shopery</span>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-surface p-7 shadow-card">
        <h1 className="text-[19px] font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-ink-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-5 text-center text-[13px] text-ink-secondary">{footer}</div>}

      <div className="mt-6 text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted hover:text-ink-secondary">
          <ArrowLeftIcon size={13} /> Back to home
        </Link>
      </div>
    </div>
  </div>
);

export default AuthLayout;
