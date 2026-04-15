import React, { useState, useCallback, memo, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import useUserShop from "../hooks/useUserShop";
import CreateShopModal from "./Modals/CreateShopModal";

const LEAGUE_URL = "https://shopery-league.vercel.app/";

const NotificationBanner = memo(({ type, message, onClose }) => (
    <div style={{
        position: "fixed", top: "16px", right: "16px", zIndex: 9999,
        maxWidth: "360px",
    }}>
        <div style={{
            background: type === "success" ? "#E8F5EE" : "#FEF2F2",
            border: `1px solid ${type === "success" ? "#B8DFC8" : "#FECACA"}`,
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 500,
            color: type === "success" ? "#2C6E49" : "#991B1B",
            fontFamily: "'Instrument Sans', sans-serif",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
            <i className={`fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} />
            <p style={{ margin: 0 }}>{message}</p>
            <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, fontSize: "16px", lineHeight: 1 }}>×</button>
        </div>
    </div>
));

const ShopStatusButton = memo(({ shopStatus, onCreateClick, navigate }) => {
    if (shopStatus === "NONE" || shopStatus === "CLOSED") {
        return (
            <button
                onClick={onCreateClick}
                style={S.shopBtn("gradient")}
            >
                <i className="fa-solid fa-store" style={{ marginRight: "6px" }} />
                Start Selling
                <span style={S.newPill}>NEW</span>
            </button>
        );
    }
    if (shopStatus === "PENDING") {
        return (
            <div style={S.pendingPill}>
                <i className="fa-solid fa-clock" style={{ marginRight: "6px", animation: "pulse 1.5s infinite" }} />
                Pending Approval
            </div>
        );
    }
    if (shopStatus === "ACTIVE") {
        return (
            <button onClick={() => navigate("/shop/dashboard")} style={S.shopBtn("emerald")}>
                <i className="fa-solid fa-tachometer-alt" style={{ marginRight: "6px" }} />
                My Dashboard
            </button>
        );
    }
    return null;
});

const LeagueButton = memo(({ authenticated, navigate }) => (
    <button
        onClick={() => authenticated ? window.open(LEAGUE_URL, "_blank", "noopener,noreferrer") : navigate("/signin")}
        style={S.leagueBtn}
    >
        <i className="fa-solid fa-trophy" style={{ marginRight: "6px" }} />
        League
    </button>
));

const Header = memo(() => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const { itemCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const { shop, shopStatus, refetch } = useUserShop();
    const navigate = useNavigate();
    const authenticated = useMemo(() => isAuthenticated(), []);

    const handleShopCreated = useCallback(() => {
        setShowCreateModal(false);
        refetch();
        setNotification({ type: "success", message: "Shop submitted! You'll be notified once it's approved." });
        setTimeout(() => setNotification(null), 5000);
    }, [refetch]);

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>

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

            <header style={S.header}>
                <div style={S.inner}>
                    {/* Logo */}
                    <div style={S.left}>
                        <Link to="/" style={S.logoLink}>
                            <div style={S.logoBox}>
                                <i className="fa-solid fa-leaf" style={{ color: "#FAFAF8", fontSize: "18px" }} />
                            </div>
                            <span style={S.logoText}>Shopery</span>
                        </Link>

                        <nav style={S.nav}>
                            {[
                                { label: "Home", to: "/" },
                                { label: "Products", to: "/products" },
                                { label: "Shops", to: "/shops" },
                                { label: "Blogs", to: "/blogs" },
                            ].map(({ label, to }) => (
                                <Link key={label} to={to} style={S.navLink}>{label}</Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right actions */}
                    <div style={S.right}>
                        <LeagueButton authenticated={authenticated} navigate={navigate} />

                        {authenticated && (
                            <ShopStatusButton
                                shopStatus={shopStatus}
                                shop={shop}
                                onCreateClick={() => setShowCreateModal(true)}
                                navigate={navigate}
                            />
                        )}

                        {/* Wishlist icon */}
                        <Link to="/wishlist" style={S.iconBtn} title="Wishlist">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            {wishlistCount > 0 && (
                                <span style={{ ...S.badge, background: "#E8321C" }}>{wishlistCount}</span>
                            )}
                        </Link>

                        {/* Cart icon → full cart page */}
                        <Link to="/cart" style={S.iconBtn} title="Cart">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            {itemCount > 0 && (
                                <span style={S.badge}>{itemCount}</span>
                            )}
                        </Link>

                        {/* Auth */}
                        {authenticated ? (
                            <Link to="/profile" style={S.iconBtn} title="Profile">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </Link>
                        ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Link to="/signin" style={S.signInBtn}>Sign In</Link>
                                <Link to="/register" style={S.signUpBtn}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
        </>
    );
});

Header.displayName = "Header";
export default Header;

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
    header: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "72px",
        background: "rgba(250,250,248,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ECEAE4",
        zIndex: 40,
        fontFamily: "'Instrument Sans', sans-serif",
    },
    inner: {
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 28px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    left: { display: "flex", alignItems: "center", gap: "40px" },
    logoLink: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
    logoBox: {
        width: "38px",
        height: "38px",
        background: "#1A1A18",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "20px",
        fontWeight: 400,
        color: "#1A1A18",
    },
    nav: { display: "flex", gap: "28px" },
    navLink: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#4A4A44",
        textDecoration: "none",
        letterSpacing: "0.02em",
        transition: "color 0.12s",
    },
    right: { display: "flex", alignItems: "center", gap: "10px" },
    iconBtn: {
        position: "relative",
        width: "38px",
        height: "38px",
        borderRadius: "10px",
        background: "#F7F6F3",
        border: "1px solid #ECEAE4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#2C2C28",
        textDecoration: "none",
        transition: "background 0.12s",
    },
    badge: {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        minWidth: "18px",
        height: "18px",
        background: "#1A1A18",
        color: "#FAFAF8",
        fontSize: "10px",
        fontWeight: 700,
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        border: "1.5px solid #FAFAF8",
    },
    leagueBtn: {
        padding: "8px 16px",
        background: "linear-gradient(135deg, #5B21B6, #4338CA)",
        color: "#FAFAF8",
        border: "none",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.03em",
        fontFamily: "'Instrument Sans', sans-serif",
        display: "flex",
        alignItems: "center",
    },
    shopBtn: (variant) => ({
        padding: "8px 16px",
        background: variant === "gradient"
            ? "linear-gradient(135deg, #F97316, #EF4444)"
            : "linear-gradient(135deg, #16A34A, #15803D)",
        color: "#FAFAF8",
        border: "none",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.03em",
        fontFamily: "'Instrument Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        position: "relative",
    }),
    newPill: {
        marginLeft: "6px",
        background: "#FBBF24",
        color: "#92400E",
        fontSize: "9px",
        fontWeight: 800,
        borderRadius: "5px",
        padding: "1px 5px",
        letterSpacing: "0.04em",
    },
    pendingPill: {
        padding: "8px 14px",
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#92400E",
        display: "flex",
        alignItems: "center",
    },
    signInBtn: {
        padding: "8px 16px",
        background: "#F7F6F3",
        border: "1px solid #ECEAE4",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#4A4A44",
        textDecoration: "none",
    },
    signUpBtn: {
        padding: "8px 16px",
        background: "#1A1A18",
        border: "1px solid #1A1A18",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#FAFAF8",
        textDecoration: "none",
    },
};