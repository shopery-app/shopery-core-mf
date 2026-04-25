import React, { useState, useCallback, memo, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import useUserShop from "../hooks/useUserShop";
import CreateShopModal from "./Modals/CreateShopModal";

const LEAGUE_URL = "https://shopery-league.vercel.app/";

/* ── Notification Banner ─────────────────────────────────────── */
const NotificationBanner = memo(({ type, message, onClose }) => (
    <div className="notif-wrap">
        <div className={`notif-inner notif-${type}`}>
            <i className={`fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} />
            <p>{message}</p>
            <button onClick={onClose} className="notif-close">×</button>
        </div>
    </div>
));

/* ── Mobile Menu ─────────────────────────────────────────────── */
const MobileMenu = memo(({ open, onClose, authenticated, shopStatus, onCreateClick, navigate }) => {
    const location = useLocation();
    const navItems = [
        { label: "Home", to: "/" },
        { label: "Products", to: "/products" },
        { label: "Shops", to: "/shops" },
        { label: "Blogs", to: "/blogs" },
    ];
    return (
        <>
            <div className={`mobile-overlay ${open ? "open" : ""}`} onClick={onClose} />
            <nav className={`mobile-menu ${open ? "open" : ""}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-logo">
                        <div className="logo-box"><i className="fa-solid fa-leaf" /></div>
                        <span className="logo-text">Shopery</span>
                    </div>
                    <button className="mobile-close" onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="mobile-nav">
                    {navItems.map(({ label, to }) => (
                        <Link
                            key={label} to={to}
                            className={`mobile-nav-link ${location.pathname === to ? "active" : ""}`}
                            onClick={onClose}
                        >
                            {label}
                            <i className="fa-solid fa-chevron-right mobile-chevron" />
                        </Link>
                    ))}
                </div>

                <div className="mobile-actions">
                    <button
                        className="mobile-league-btn"
                        onClick={() => { authenticated ? window.open(LEAGUE_URL, "_blank", "noopener,noreferrer") : navigate("/signin"); onClose(); }}
                    >
                        <i className="fa-solid fa-trophy" /> League
                    </button>

                    {authenticated && shopStatus === "NONE" && (
                        <button className="mobile-shop-btn" onClick={() => { onCreateClick(); onClose(); }}>
                            <i className="fa-solid fa-store" /> Start Selling
                            <span className="new-pill">NEW</span>
                        </button>
                    )}
                    {authenticated && shopStatus === "ACTIVE" && (
                        <button className="mobile-shop-btn" onClick={() => { navigate("/shop/dashboard"); onClose(); }}>
                            <i className="fa-solid fa-tachometer-alt" /> My Dashboard
                        </button>
                    )}

                    <div className="mobile-auth-row">
                        {authenticated ? (
                            <Link to="/profile" className="mobile-auth-btn primary" onClick={onClose}>
                                <i className="fa-solid fa-user" /> Profile
                            </Link>
                        ) : (
                            <>
                                <Link to="/signin" className="mobile-auth-btn secondary" onClick={onClose}>Sign In</Link>
                                <Link to="/register" className="mobile-auth-btn primary" onClick={onClose}>Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
});

/* ── Main Header ─────────────────────────────────────────────── */
const Header = memo(() => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { itemCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const { shop, shopStatus, refetch } = useUserShop();
    const navigate = useNavigate();
    const location = useLocation();
    const authenticated = useMemo(() => isAuthenticated(), []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const handleShopCreated = useCallback(() => {
        setShowCreateModal(false);
        refetch();
        setNotification({ type: "success", message: "Shop submitted! You'll be notified once it's approved." });
        setTimeout(() => setNotification(null), 5000);
    }, [refetch]);

    const navItems = [
        { label: "Home", to: "/" },
        { label: "Products", to: "/products" },
        { label: "Shops", to: "/shops" },
        { label: "Blogs", to: "/blogs" },
    ];

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
        /* ── Reset & Variables ── */
        :root {
          --h-height: 68px;
          --surface: rgba(250,250,248,0.97);
          --border: #ECEAE4;
          --text-primary: #1A1A18;
          --text-secondary: #4A4A44;
          --text-muted: #888880;
          --emerald: #16A34A;
          --emerald-dark: #15803D;
          --accent: #F97316;
          --font-sans: 'Instrument Sans', sans-serif;
          --font-serif: 'DM Serif Display', serif;
          --radius: 10px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
          --transition: 0.18s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Header Shell ── */
        .site-header {
          position: fixed; top: 0; left: 0; right: 0;
          height: var(--h-height);
          background: var(--surface);
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          border-bottom: 1px solid var(--border);
          z-index: 999;
          font-family: var(--font-sans);
          transition: box-shadow var(--transition), background var(--transition);
        }
        .site-header.scrolled {
          box-shadow: var(--shadow-md);
          background: rgba(250,250,248,0.99);
        }
        .header-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 24px; height: 100%;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
        }

        /* ── Logo ── */
        .header-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
        }
        .logo-box {
          width: 36px; height: 36px;
          background: var(--text-primary);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #FAFAF8; font-size: 15px;
          transition: transform var(--transition);
        }
        .header-logo:hover .logo-box { transform: rotate(-8deg) scale(1.05); }
        .logo-text {
          font-family: var(--font-serif);
          font-size: 20px; font-weight: 400;
          color: var(--text-primary);
        }

        /* ── Desktop Nav ── */
        .header-nav {
          display: flex; align-items: center; gap: 4px;
        }
        .nav-link {
          position: relative;
          padding: 6px 12px;
          font-size: 13px; font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 8px;
          transition: color var(--transition), background var(--transition);
          letter-spacing: 0.02em;
        }
        .nav-link:hover { color: var(--text-primary); background: #F0EFEA; }
        .nav-link.active { color: var(--text-primary); }
        .nav-link.active::after {
          content: '';
          position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--emerald);
        }

        /* ── Right Actions ── */
        .header-right {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }

        /* ── Icon Buttons ── */
        .icon-btn {
          position: relative;
          width: 38px; height: 38px;
          border-radius: var(--radius);
          background: #F7F6F3;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-primary);
          text-decoration: none;
          transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
          cursor: pointer;
        }
        .icon-btn:hover {
          background: #EEECEA;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .badge {
          position: absolute; top: -5px; right: -5px;
          min-width: 18px; height: 18px;
          background: var(--text-primary); color: #FAFAF8;
          font-size: 9px; font-weight: 800;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          border: 2px solid #FAFAF8;
          font-family: var(--font-sans);
        }
        .badge-red { background: #E8321C; }

        /* ── CTA Buttons ── */
        .league-btn {
          padding: 8px 14px;
          background: linear-gradient(135deg, #5B21B6, #4338CA);
          color: #FAFAF8; border: none; border-radius: var(--radius);
          font-size: 12px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          font-family: var(--font-sans); letter-spacing: 0.03em;
          transition: opacity var(--transition), transform var(--transition);
          white-space: nowrap;
        }
        .league-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .shop-btn {
          padding: 8px 14px;
          color: #FAFAF8; border: none; border-radius: var(--radius);
          font-size: 12px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          font-family: var(--font-sans); letter-spacing: 0.03em;
          transition: opacity var(--transition), transform var(--transition);
          white-space: nowrap; position: relative;
        }
        .shop-btn.gradient { background: linear-gradient(135deg, #F97316, #EF4444); }
        .shop-btn.emerald { background: linear-gradient(135deg, #16A34A, #15803D); }
        .shop-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .pending-pill {
          padding: 7px 12px;
          background: #FFFBEB; border: 1px solid #FDE68A;
          border-radius: var(--radius);
          font-size: 11px; font-weight: 600; color: #92400E;
          display: flex; align-items: center; gap: 6px;
          white-space: nowrap;
        }

        .new-pill {
          background: #FBBF24; color: #92400E;
          font-size: 9px; font-weight: 800;
          border-radius: 5px; padding: 2px 5px;
          letter-spacing: 0.04em;
        }

        .sign-in-btn {
          padding: 8px 14px;
          background: #F7F6F3; border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
          text-decoration: none;
          transition: background var(--transition);
          white-space: nowrap;
        }
        .sign-in-btn:hover { background: #EEECEA; }
        .sign-up-btn {
          padding: 8px 14px;
          background: var(--text-primary); border: 1px solid var(--text-primary);
          border-radius: var(--radius);
          font-size: 12px; font-weight: 600; color: #FAFAF8;
          text-decoration: none;
          transition: opacity var(--transition);
          white-space: nowrap;
        }
        .sign-up-btn:hover { opacity: 0.85; }

        /* ── Hamburger ── */
        .hamburger {
          display: none;
          width: 38px; height: 38px;
          border-radius: var(--radius);
          background: #F7F6F3; border: 1px solid var(--border);
          align-items: center; justify-content: center;
          cursor: pointer; flex-direction: column; gap: 5px;
          padding: 0; transition: background var(--transition);
        }
        .hamburger:hover { background: #EEECEA; }
        .ham-line {
          width: 18px; height: 2px; border-radius: 2px;
          background: var(--text-primary);
          transition: transform 0.25s ease, opacity 0.2s ease;
        }
        .hamburger.open .ham-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open .ham-line:nth-child(2) { opacity: 0; }
        .hamburger.open .ham-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile Menu ── */
        .mobile-overlay {
          display: none; position: fixed;
          inset: 0; background: rgba(0,0,0,0.35);
          z-index: 1000; opacity: 0;
          transition: opacity 0.25s ease;
        }
        .mobile-overlay.open { opacity: 1; }
        .mobile-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 85vw);
          background: #FAFAF8;
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          overflow-y: auto;
        }
        .mobile-menu.open { transform: translateX(0); }

        .mobile-menu-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--border);
        }
        .mobile-logo {
          display: flex; align-items: center; gap: 10px;
        }
        .mobile-close {
          width: 32px; height: 32px;
          border-radius: 8px; border: 1px solid var(--border);
          background: #F7F6F3; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          transition: background var(--transition);
        }
        .mobile-close:hover { background: #EEECEA; }

        .mobile-nav {
          padding: 12px 16px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .mobile-nav-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 12px;
          font-size: 14px; font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 10px;
          transition: background var(--transition), color var(--transition);
        }
        .mobile-nav-link:hover, .mobile-nav-link.active {
          background: #F0EFEA; color: var(--text-primary);
        }
        .mobile-nav-link.active { color: var(--emerald); }
        .mobile-chevron { font-size: 10px; opacity: 0.4; }

        .mobile-actions {
          padding: 16px; margin-top: auto;
          display: flex; flex-direction: column; gap: 10px;
          border-top: 1px solid var(--border);
        }
        .mobile-league-btn {
          width: 100%; padding: 11px 16px;
          background: linear-gradient(135deg, #5B21B6, #4338CA);
          color: #FAFAF8; border: none; border-radius: var(--radius);
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-sans);
        }
        .mobile-shop-btn {
          width: 100%; padding: 11px 16px;
          background: linear-gradient(135deg, #F97316, #EF4444);
          color: #FAFAF8; border: none; border-radius: var(--radius);
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-sans);
        }
        .mobile-auth-row {
          display: flex; gap: 8px;
        }
        .mobile-auth-btn {
          flex: 1; padding: 11px 14px;
          border-radius: var(--radius);
          font-size: 13px; font-weight: 600;
          text-decoration: none; text-align: center;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: var(--font-sans);
        }
        .mobile-auth-btn.primary { background: var(--text-primary); color: #FAFAF8; }
        .mobile-auth-btn.secondary { background: #F7F6F3; border: 1px solid var(--border); color: var(--text-secondary); }

        /* ── Notification ── */
        .notif-wrap {
          position: fixed; top: 16px; right: 16px;
          z-index: 9999; max-width: 360px;
          animation: slideInRight 0.3s ease;
        }
        .notif-inner {
          border-radius: 12px; padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 500;
          font-family: var(--font-sans);
          box-shadow: var(--shadow-md);
        }
        .notif-success {
          background: #E8F5EE; border: 1px solid #B8DFC8; color: #2C6E49;
        }
        .notif-error {
          background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B;
        }
        .notif-inner p { margin: 0; flex: 1; }
        .notif-close {
          background: none; border: none; cursor: pointer;
          color: inherit; opacity: 0.5; font-size: 18px; line-height: 1; padding: 0;
        }
        .notif-close:hover { opacity: 1; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 1024px) {
          .league-btn span, .shop-btn span:not(.new-pill) { display: none; }
          .header-nav { gap: 2px; }
          .nav-link { padding: 6px 10px; font-size: 12.5px; }
        }

        @media (max-width: 768px) {
          .header-nav { display: none; }
          .league-btn { display: none; }
          .shop-btn { display: none; }
          .pending-pill { display: none; }
          .sign-in-btn, .sign-up-btn { display: none; }
          .hamburger { display: flex; }
          .mobile-overlay { display: block; pointer-events: none; }
          .mobile-overlay.open { pointer-events: all; }
        }

        @media (max-width: 480px) {
          .header-inner { padding: 0 16px; }
          .logo-text { font-size: 18px; }
        }

        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

            {notification && (
                <NotificationBanner
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {showCreateModal && (
                <CreateShopModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleShopCreated}
                />
            )}

            <MobileMenu
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                authenticated={authenticated}
                shopStatus={shopStatus}
                onCreateClick={() => setShowCreateModal(true)}
                navigate={navigate}
            />

            <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
                <div className="header-inner">
                    {/* Logo */}
                    <Link to="/" className="header-logo">
                        <div className="logo-box"><i className="fa-solid fa-leaf" /></div>
                        <span className="logo-text">Shopery</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="header-nav">
                        {navItems.map(({ label, to }) => (
                            <Link
                                key={label} to={to}
                                className={`nav-link ${location.pathname === to ? "active" : ""}`}
                            >{label}</Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="header-right">
                        {/* League */}
                        <button
                            className="league-btn"
                            onClick={() => authenticated ? window.open(LEAGUE_URL, "_blank", "noopener,noreferrer") : navigate("/signin")}
                        >
                            <i className="fa-solid fa-trophy" />
                            <span>League</span>
                        </button>

                        {/* Shop Status */}
                        {authenticated && (shopStatus === "NONE" || shopStatus === "CLOSED") && (
                            <button className="shop-btn gradient" onClick={() => setShowCreateModal(true)}>
                                <i className="fa-solid fa-store" />
                                <span>Start Selling</span>
                                <span className="new-pill">NEW</span>
                            </button>
                        )}
                        {authenticated && shopStatus === "PENDING" && (
                            <div className="pending-pill">
                                <i className="fa-solid fa-clock" style={{ animation: "pulse 1.5s infinite" }} />
                                Pending
                            </div>
                        )}
                        {authenticated && shopStatus === "ACTIVE" && (
                            <button className="shop-btn emerald" onClick={() => navigate("/shop/dashboard")}>
                                <i className="fa-solid fa-tachometer-alt" />
                                <span>Dashboard</span>
                            </button>
                        )}

                        {/* Wishlist */}
                        <Link to="/wishlist" className="icon-btn" title="Wishlist">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            {wishlistCount > 0 && <span className="badge badge-red">{wishlistCount}</span>}
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="icon-btn" title="Cart">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            {itemCount > 0 && <span className="badge">{itemCount}</span>}
                        </Link>

                        {/* Auth */}
                        {authenticated ? (
                            <Link to="/profile" className="icon-btn" title="Profile">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </Link>
                        ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Link to="/signin" className="sign-in-btn">Sign In</Link>
                                <Link to="/register" className="sign-up-btn">Sign Up</Link>
                            </div>
                        )}

                        {/* Hamburger */}
                        <button
                            className={`hamburger ${mobileOpen ? "open" : ""}`}
                            onClick={() => setMobileOpen(o => !o)}
                            aria-label="Menu"
                        >
                            <div className="ham-line" />
                            <div className="ham-line" />
                            <div className="ham-line" />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
});

Header.displayName = "Header";
export default Header;