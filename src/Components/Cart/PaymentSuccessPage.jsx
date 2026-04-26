import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useCart from "../../hooks/useCart";

/**
 * PaymentSuccessPage
 *
 * Stripe redirects here after a successful payment with ?session_id=xxx.
 * - We immediately refresh the cart (should be empty now since webhook cleared it)
 * - We poll fetchMyOrders a few times to wait for the webhook to process
 * - We show the orders once they arrive, or a fallback after timeout
 */
const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const navigate = useNavigate();

    const { refreshCart, loadMyOrders, orders, ordersLoading } = useCart({ autoFetch: false });

    const [pollCount, setPollCount] = useState(0);
    const [timedOut, setTimedOut] = useState(false);
    const MAX_POLLS = 6;       // Try up to 6 times
    const POLL_INTERVAL = 3000; // Every 3 seconds

    useEffect(() => {
        if (!sessionId) {
            navigate("/cart");
            return;
        }

        // Refresh cart immediately (should now be empty after webhook)
        refreshCart();

        // Start polling for orders
        const poll = () => {
            loadMyOrders().then((action) => {
                const fetchedOrders = action?.payload || [];
                if (fetchedOrders.length > 0) {
                    // Orders found — stop polling
                    return;
                }

                setPollCount((c) => {
                    const next = c + 1;
                    if (next >= MAX_POLLS) {
                        setTimedOut(true);
                    }
                    return next;
                });
            });
        };

        // First immediate fetch
        poll();

        // Then poll on interval
        const interval = setInterval(() => {
            setPollCount((c) => {
                if (c >= MAX_POLLS || orders.length > 0) {
                    clearInterval(interval);
                    return c;
                }
                return c;
            });
            poll();
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Stop polling once we have orders
    useEffect(() => {
        if (orders.length > 0) {
            setPollCount(MAX_POLLS); // Stop further polls
        }
    }, [orders]);

    const isWaiting = ordersLoading || (orders.length === 0 && pollCount < MAX_POLLS && !timedOut);

    return (
        <div style={S.page}>
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap"
                rel="stylesheet"
            />

            <div style={S.container}>
                {/* Success icon */}
                <div style={S.iconWrap}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2C6E49" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>

                <h1 style={S.title}>Payment Successful</h1>
                <p style={S.subtitle}>
                    {isWaiting
                        ? "Confirming your order — this takes just a moment…"
                        : orders.length > 0
                            ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed successfully.`
                            : "Your payment was received. Orders may take a moment to appear."}
                </p>

                {/* Waiting state */}
                {isWaiting && (
                    <div style={S.waitBox}>
                        <div style={S.spinner} />
                        <span style={S.waitText}>Processing your order…</span>
                    </div>
                )}

                {/* Orders list */}
                {!isWaiting && orders.length > 0 && (
                    <div style={S.ordersList}>
                        {orders.slice(0, 3).map((order) => (
                            <div key={order.id} style={S.orderCard}>
                                <div style={S.orderRow}>
                                    <div>
                                        <div style={S.shopName}>{order.shopName}</div>
                                        <div style={S.orderId}>
                                            Order #{String(order.id).slice(-8).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={S.statusBadge}>{order.status}</div>
                                        <div style={S.orderTotal}>${Number(order.totalPrice).toFixed(2)}</div>
                                    </div>
                                </div>
                                <div style={S.itemsList}>
                                    {(order.items || []).map((it, i) => (
                                        <div key={i} style={S.itemRow}>
                                            <span style={S.itemName}>{it.productName}</span>
                                            <span style={S.itemMeta}>
                                                ×{it.quantity} · ${Number(it.unitPrice).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {orders.length > 3 && (
                            <p style={S.moreHint}>+{orders.length - 3} more order{orders.length - 3 !== 1 ? "s" : ""}</p>
                        )}
                    </div>
                )}

                {/* Timed out with no orders */}
                {timedOut && orders.length === 0 && (
                    <div style={S.infoBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                        <span>Your payment was received but order confirmation is still processing. Check your orders in a few minutes.</span>
                    </div>
                )}

                {/* Actions */}
                <div style={S.actions}>
                    <Link to="/cart?tab=orders" style={S.primaryBtn}>
                        View All Orders
                    </Link>
                    <Link to="/products" style={S.secondaryBtn}>
                        Continue Shopping
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.85) translateY(12px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccessPage;

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
        maxWidth: "560px",
        width: "100%",
        textAlign: "center",
        animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    },
    iconWrap: {
        width: "64px",
        height: "64px",
        background: "#E8F5EE",
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
        margin: "0 0 32px",
        lineHeight: 1.6,
    },
    waitBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "#F7F6F3",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "32px",
    },
    spinner: {
        width: "18px",
        height: "18px",
        border: "2px solid #DEDAD4",
        borderTopColor: "#1A1A18",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
    },
    waitText: {
        fontSize: "13px",
        fontWeight: 500,
        color: "#6B6B65",
    },
    ordersList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "32px",
        textAlign: "left",
    },
    orderCard: {
        background: "#F7F6F3",
        borderRadius: "14px",
        padding: "16px 18px",
    },
    orderRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px",
    },
    shopName: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "15px",
        color: "#1A1A18",
        marginBottom: "2px",
    },
    orderId: {
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        color: "#B0ADA5",
    },
    statusBadge: {
        display: "inline-block",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "3px 8px",
        borderRadius: "6px",
        background: "#E8F5EE",
        color: "#2C6E49",
        marginBottom: "4px",
        textAlign: "right",
    },
    orderTotal: {
        fontSize: "14px",
        fontWeight: 700,
        color: "#1A1A18",
        textAlign: "right",
    },
    itemsList: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        borderTop: "1px solid #ECEAE4",
        paddingTop: "10px",
    },
    itemRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemName: {
        fontSize: "12px",
        color: "#2C2C28",
        fontWeight: 500,
    },
    itemMeta: {
        fontSize: "11px",
        color: "#9B9B94",
    },
    moreHint: {
        fontSize: "12px",
        color: "#9B9B94",
        textAlign: "center",
        margin: 0,
    },
    infoBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        borderRadius: "12px",
        padding: "14px 16px",
        marginBottom: "28px",
        fontSize: "13px",
        color: "#92400E",
        textAlign: "left",
        lineHeight: 1.5,
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