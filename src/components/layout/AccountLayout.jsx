import { NavLink } from "react-router-dom";
import clsx from "clsx";
import PageShell from "./PageShell";
import { UserIcon, MapPinIcon, PackageIcon, SettingsIcon, HeartIcon } from "../ui/icons";

const NAV = [
  { label: "Overview", to: "/profile", icon: UserIcon, end: true },
  { label: "Orders", to: "/orders", icon: PackageIcon },
  { label: "Addresses", to: "/profile/addresses", icon: MapPinIcon },
  { label: "Wishlist", to: "/wishlist", icon: HeartIcon },
  { label: "Settings", to: "/profile/settings", icon: SettingsIcon },
];

const AccountLayout = ({ title, description, children }) => (
  <PageShell>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {(title || description) && (
        <div className="mb-8">
          {title && <h1 className="text-2xl font-semibold text-ink">{title}</h1>}
          {description && <p className="mt-1.5 text-[14px] text-ink-secondary">{description}</p>}
        </div>
      )}
      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                  isActive ? "bg-ink text-ink-inverse" : "text-ink-secondary hover:bg-surface-sunken",
                )
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  </PageShell>
);

export default AccountLayout;
