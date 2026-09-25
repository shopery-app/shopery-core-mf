import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import useProfile from "../../hooks/useProfile";
import { isAuthenticated } from "../../utils/auth";
import { signedOut } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import CreateShopModal from "../../features/merchant/CreateShopModal";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";
import {
  CartIcon,
  HeartIcon,
  MenuIcon,
  CloseIcon,
  StoreIcon,
  DashboardIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  PackageIcon,
  ClockIcon,
  ChevronDownIcon,
} from "../ui/icons";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Shops", to: "/shops" },
  { label: "Blogs", to: "/blogs" },
];

const navLinkClass = ({ isActive }) =>
  clsx(
    "rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
    isActive ? "text-ink" : "text-ink-secondary hover:text-ink hover:bg-surface-sunken",
  );

const ProfileMenu = memo(({ shopStatus, profile, onCreateShop }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = () => {
    dispatch(signedOut());
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-surface py-1 pl-1 pr-2 hover:bg-surface-sunken"
      >
        <Avatar src={profile?.profilePhoto} name={`${profile?.firstName || ""} ${profile?.lastName || ""}`} size="sm" />
        <ChevronDownIcon size={13} className="text-ink-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-60 rounded-lg border border-border bg-surface py-1.5 shadow-popover">
          <div className="border-b border-border px-3.5 py-2.5">
            <p className="truncate text-[13.5px] font-semibold text-ink">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="truncate text-xs text-ink-muted">{profile?.email}</p>
          </div>
          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-ink-secondary hover:bg-surface-sunken">
            <UserIcon size={15} /> Profile
          </Link>
          <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-ink-secondary hover:bg-surface-sunken">
            <PackageIcon size={15} /> Orders
          </Link>
          <Link to="/profile/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-ink-secondary hover:bg-surface-sunken">
            <SettingsIcon size={15} /> Settings
          </Link>
          <div className="my-1 border-t border-border" />
          {shopStatus === "ACTIVE" && (
            <Link to="/shop/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-ink-secondary hover:bg-surface-sunken">
              <DashboardIcon size={15} /> Shop dashboard
            </Link>
          )}
          {shopStatus === "PENDING" && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-warning">
              <ClockIcon size={15} /> Shop request pending
            </div>
          )}
          {(shopStatus === "NONE" || shopStatus === "CLOSED") && (
            <button
              onClick={() => {
                setOpen(false);
                onCreateShop();
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-ink-secondary hover:bg-surface-sunken"
            >
              <StoreIcon size={15} /> Start selling
            </button>
          )}
          <div className="my-1 border-t border-border" />
          <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-danger hover:bg-danger-subtle">
            <LogOutIcon size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
});
ProfileMenu.displayName = "ProfileMenu";

const MobileNav = memo(({ open, onClose, authenticated, shopStatus, onCreateShop }) => (
  <>
    <div
      className={clsx("fixed inset-0 z-[1000] bg-ink/35 transition-opacity md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      onClick={onClose}
    />
    <nav
      className={clsx(
        "fixed inset-y-0 right-0 z-[1001] flex w-[min(320px,85vw)] flex-col bg-surface shadow-popover transition-transform duration-300 md:hidden",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="text-lg font-semibold text-ink">Menu</span>
        <IconButton size="sm" variant="ghost" onClick={onClose} aria-label="Close menu">
          <CloseIcon size={16} />
        </IconButton>
      </div>
      <div className="flex flex-col gap-1 px-3 py-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onClose} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
        {authenticated && (shopStatus === "NONE" || shopStatus === "CLOSED") && (
          <button
            onClick={() => {
              onClose();
              onCreateShop();
            }}
            className="flex items-center justify-center gap-2 rounded-md bg-ink py-2.5 text-[13px] font-semibold text-ink-inverse"
          >
            <StoreIcon size={15} /> Start selling
          </button>
        )}
        {authenticated ? (
          <Link to="/profile" onClick={onClose} className="flex items-center justify-center rounded-md border border-border py-2.5 text-[13px] font-semibold text-ink">
            My account
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link to="/signin" onClick={onClose} className="flex-1 rounded-md border border-border py-2.5 text-center text-[13px] font-semibold text-ink">
              Sign in
            </Link>
            <Link to="/register" onClick={onClose} className="flex-1 rounded-md bg-ink py-2.5 text-center text-[13px] font-semibold text-ink-inverse">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  </>
));
MobileNav.displayName = "MobileNav";

const AppHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { profile, shopStatus, refetch } = useProfile();
  const authenticated = isAuthenticated();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {showCreateShop && (
        <CreateShopModal
          onClose={() => setShowCreateShop(false)}
          onSuccess={() => {
            setShowCreateShop(false);
            refetch();
          }}
        />
      )}
      <MobileNav open={mobileOpen} onClose={closeMobile} authenticated={authenticated} shopStatus={shopStatus} onCreateShop={() => setShowCreateShop(true)} />

      <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-ink-inverse">S</span>
            <span className="text-[17px] font-semibold text-ink">Shopery</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === "/"}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {authenticated && shopStatus === "ACTIVE" && (
              <Link
                to="/shop/dashboard"
                className="hidden items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink hover:bg-surface-sunken sm:flex"
              >
                <DashboardIcon size={14} /> Dashboard
              </Link>
            )}
            {authenticated && shopStatus === "PENDING" && (
              <Badge tone="warning" className="hidden sm:inline-flex">
                Shop pending
              </Badge>
            )}
            {authenticated && (shopStatus === "NONE" || shopStatus === "CLOSED") && (
              <button
                onClick={() => setShowCreateShop(true)}
                className="hidden items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-ink-inverse hover:bg-ink/90 sm:flex"
              >
                <StoreIcon size={14} /> Start selling
              </button>
            )}

            <Link to="/wishlist" className="relative hidden sm:block">
              <IconButton as="span" size="md">
                <HeartIcon size={17} />
              </IconButton>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative">
              <IconButton as="span" size="md">
                <CartIcon size={17} />
              </IconButton>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-ink-inverse">
                  {itemCount}
                </span>
              )}
            </Link>

            {authenticated ? (
              <ProfileMenu shopStatus={shopStatus} profile={profile} onCreateShop={() => setShowCreateShop(true)} />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/signin" className="rounded-md border border-border px-3 py-1.5 text-[12.5px] font-semibold text-ink-secondary hover:bg-surface-sunken">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-ink-inverse hover:bg-ink/90">
                  Sign up
                </Link>
              </div>
            )}

            <IconButton className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon size={17} />
            </IconButton>
          </div>
        </div>
      </header>
    </>
  );
};

export default memo(AppHeader);
