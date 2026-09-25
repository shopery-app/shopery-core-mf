import { Link, NavLink } from "react-router-dom";
import clsx from "clsx";
import PageShell from "../../components/layout/PageShell";
import { ArrowLeftIcon } from "../../components/ui/icons";

const TABS = [
  { label: "My blogs", to: "/blogs/me" },
  { label: "Liked", to: "/blogs/liked" },
  { label: "Saved", to: "/blogs/saved" },
  { label: "Archived", to: "/blogs/archived" },
];

const BlogsAccountLayout = ({ title, description, actions, children }) => (
  <PageShell>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/blogs" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
        <ArrowLeftIcon size={14} /> All blogs
      </Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          {description && <p className="mt-1 text-[13.5px] text-ink-secondary">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              clsx("relative shrink-0 px-3.5 py-2.5 text-[13.5px] font-medium", isActive ? "text-ink" : "text-ink-muted hover:text-ink-secondary")
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
      {children}
    </div>
  </PageShell>
);

export default BlogsAccountLayout;
