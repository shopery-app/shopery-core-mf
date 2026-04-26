import React from "react";
import { Link } from "react-router-dom";

/**
 * PaymentCancelPage
 *
 * Stripe redirects here when the user clicks "Back" or cancels on the
 * Stripe hosted checkout page. The cart is unchanged — they can retry.
 */
const PaymentCancelPage = () => {
    return (
        <div style={S.page}>
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap"
                rel="stylesheet"
            />

            <div style={S.container}>
                {/* Cancel icon */}
                <div style={S.iconWrap}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                </div>

                <h1 style={S.title}>Payment Cancelled</h1>
                <p style={S.subtitle}>
                    No worries — your cart is still intact. You can retry checkout whenever you're ready.
                </p>

                <div style={S.actions}>
                    <Link to="/cart" style={S.primaryBtn}>
                        Return to Cart
                    </Link>
                    <Link to="/products" style={S.secondaryBtn}>
                        Continue Shopping
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.88) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PaymentCancelPage;

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
    page: {
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'Instrument Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
    },
    container: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "24px",
        padding: "52px 44px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        animation: "popIn 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) both",
    },
    iconWrap: {
        width: "64px",
        height: "64px",
        background: "#FFFBEB",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
    },
    title: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "34px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: "0 0 10px",
        lineHeight: 1.15,
    },
    subtitle: {
        fontSize: "14px",
        color: "#6B6B65",
        margin: "0 0 36px",
        lineHeight: 1.65,
    },
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    primaryBtn: {
        display: "block",
        padding: "14px",
        background: "#1A1A18",
        color: "#FAFAF8",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textDecoration: "none",
        fontFamily: "'Instrument Sans', sans-serif",
        textAlign: "center",
    },
    secondaryBtn: {
        display: "block",
        padding: "13px",
        background: "transparent",
        color: "#6B6B65",
        border: "1px solid #DEDAD4",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textDecoration: "none",
        fontFamily: "'Instrument Sans', sans-serif",
        textAlign: "center",
    },
};