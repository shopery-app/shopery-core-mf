import { Link } from "react-router-dom";
import { MailIcon, PhoneIcon } from "../ui/icons";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "Shops", to: "/shops" },
      { label: "Blogs", to: "/blogs" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Your orders", to: "/orders" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Settings", to: "/profile/settings" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help & support", to: "/profile/settings?tab=support" },
      { label: "Start selling", to: "/profile" },
    ],
  },
];

const AppFooter = () => (
  <footer className="border-t border-border bg-surface">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-ink-inverse">S</span>
            <span className="text-[16px] font-semibold text-ink">Shopery</span>
          </Link>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-muted">
            A marketplace connecting independent shops with buyers — electronics, fashion, home goods, and more.
          </p>
          <div className="mt-4 space-y-1.5 text-[13px] text-ink-muted">
            <div className="flex items-center gap-2">
              <MailIcon size={14} /> support@shopery.com
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon size={14} /> +1 (555) 010-2040
            </div>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[13px] text-ink-secondary hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[12.5px] text-ink-muted sm:flex-row">
        <p>© {new Date().getFullYear()} Shopery. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/profile/settings" className="hover:text-ink">
            Privacy
          </Link>
          <Link to="/profile/settings" className="hover:text-ink">
            Terms
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default AppFooter;
