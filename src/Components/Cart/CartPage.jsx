import React, { memo, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";
import Header from "../Header";
import Footer from "../Footer";

const fmt = (n) => Number(n || 0).toFixed(2);

const EmptyCart = () => (
    <div style={S.empty}>
        <div style={S.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="23" stroke="#DEDAD4" strokeWidth="1.5"/>
                <path d="M14 16h3l3 14h12l3-10H18" stroke="#C4BFB4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="22" cy="33" r="1.5" fill="#C4BFB4"/>
                <circle cx="31" cy="33" r="1.5" fill="#C4BFB4"/>
            </svg>
        </div>
        <h2 style={S.emptyTitle}>Your cart is empty</h2>
        <p style={S.emptyDesc}>Discover products you'll love and add them here.</p>
        <Link to="/products" style={S.browseBtn}>Browse Products</Link>
    </div>
);

const CartItem = memo(({ item, onInc, onDec, onRemove }) => {
    const {
        productId,
        quantity,
        name,
        imageUrl,
        price,
        originalPrice,
        discountPct,
        category,
        product,
    } = item;

    // Support both local and backend shapes
    const displayName = name || product?.productName || "Product";
    const displayImage = imageUrl || product?.imageUrl || "";
    const displayPrice = price || Number(product?.currentPrice || 0);
    const displayOriginal = originalPrice || Number(product?.discountDto?.originalPrice || 0);
    const displayDiscount = discountPct || product?.discountDto?.percentage || 0;
    const displayCategory = category || (typeof product?.category === "object" ? product?.category?.name : product?.category) || "";
    const total = displayPrice * quantity;
    const [imgError, setImgError] = useState(false);

    return (
        <div style={S.item}>
            <div style={S.itemImg}>
                {!imgError && displayImage ? (
                    <img src={displayImage} alt={displayName} style={S.itemImgTag} onError={() => setImgError(true)} loading="lazy"/>
                ) : (
                    <div style={S.itemImgPlaceholder}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#C4BFB4" strokeWidth="1.5"/><circle cx="9" cy="10" r="2" stroke="#C4BFB4" strokeWidth="1.5"/><path d="M3 18l5-4 4 4 4-3 5 4" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    </div>
                )}
                {displayDiscount > 0 && <div style={S.itemBadge}>−{displayDiscount}%</div>}
            </div>

            <div style={S.itemBody}>
                <div style={S.itemTop}>
                    <div>
                        {displayCategory && <span style={S.itemCategory}>{displayCategory}</span>}
                        <h4 style={S.itemName}>{displayName}</h4>
                    </div>
                    <button onClick={() => onRemove(productId)} style={S.removeBtn} title="Remove">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <div style={S.itemBottom}>
                    <div style={S.qtyRow}>
                        <button onClick={() => onDec(productId)} disabled={quantity <= 1} style={S.qBtn(quantity <= 1)}>−</button>
                        <span style={S.qVal}>{quantity}</span>
                        <button onClick={() => onInc(productId)} style={S.qBtn(false)}>+</button>
                    </div>

                    <div style={S.itemPrices}>
                        <span style={S.itemTotal}>${fmt(total)}</span>
                        {displayOriginal > displayPrice && (
                            <span style={S.itemOriginal}>${fmt(displayOriginal * quantity)}</span>
                        )}
                        <span style={S.itemUnit}>${fmt(displayPrice)} each</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
CartItem.displayName = "CartItem";

const OrderCard = memo(({ order }) => (
    <div style={S.orderCard}>
        <div style={S.orderHeader}>
            <div>
                <div style={S.orderShop}>{order.shopName}</div>
                <div style={S.orderId}>Order #{String(order.id).slice(-8).toUpperCase()}</div>
            </div>
            <div style={S.orderStatus(order.status)}>{order.status}</div>
        </div>
        <div style={S.orderItems}>
            {(order.items || []).map((it, i) => (
                <div key={i} style={S.orderItem}>
                    <span style={S.orderItemName}>{it.productName}</span>
                    <span style={S.orderItemDetail}>×{it.quantity} · ${Number(it.subtotal).toFixed(2)}</span>
                </div>
            ))}
        </div>
        <div style={S.orderFooter}>
            <span style={S.orderDate}>{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span style={S.orderTotal}>Total: ${Number(order.totalPrice).toFixed(2)}</span>
        </div>
    </div>
));
OrderCard.displayName = "OrderCard";

const CartPage = memo(() => {
    const navigate = useNavigate();
    const {
        cartItems,
        cartTotal,
        itemCount,
        loading,
        checkoutLoading,
        checkoutError,
        orders,
        ordersLoading,
        increaseProductQuantity,
        decreaseProductQuantity,
        removeFromCart,
        clearCart,
        checkout,
        loadMyOrders,
    } = useCart();

    const [tab, setTab] = useState("cart"); // "cart" | "orders"
    const [checkoutDone, setCheckoutDone] = useState(false);
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (tab === "orders" && token) loadMyOrders();
    }, [tab, token]);

    const handleCheckout = useCallback(async () => {
        if (!token) { navigate("/signin"); return; }
        const action = await checkout();
        if (!action?.error) {
            setCheckoutDone(true);
            setTab("orders");
            loadMyOrders();
        }
    }, [checkout, token, navigate, loadMyOrders]);

    return (
        <div style={S.page}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
            <Header />
            <div style={S.container}>
                {/* Page header */}
                <div style={S.pageHeader}>
                    <div>
                        <h1 style={S.pageTitle}>
                            {tab === "cart" ? "Your Cart" : "My Orders"}
                        </h1>
                        <p style={S.pageSubtitle}>
                            {tab === "cart"
                                ? itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? "s" : ""} ready to checkout` : "Nothing here yet"
                                : "Track your order history"}
                        </p>
                    </div>

                    <div style={S.tabRow}>
                        {[
                            { key: "cart", label: "CART" + (itemCount > 0 ? ` (${itemCount})` : "") },
                            { key: "orders", label: "ORDERS" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                style={tab === key ? S.tabActive : S.tab}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Checkout success banner */}
                {checkoutDone && (
                    <div style={S.successBanner}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C6E49" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        <span>Order placed successfully! Your items are on their way.</span>
                        <button onClick={() => setCheckoutDone(false)} style={S.dismissBtn}>×</button>
                    </div>
                )}

                {/* CART TAB */}
                {tab === "cart" && (
                    cartItems.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <div style={S.layout}>
                            {/* Items */}
                            <div style={S.itemsCol}>
                                <div style={S.itemsHeader}>
                                    <span style={S.itemsCount}>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                                    <button onClick={clearCart} style={S.clearBtn}>Clear all</button>
                                </div>

                                <div style={S.itemsList}>
                                    {cartItems.map((item, idx) => (
                                        <CartItem
                                            key={String(item.productId ?? idx)}
                                            item={item}
                                            onInc={increaseProductQuantity}
                                            onDec={decreaseProductQuantity}
                                            onRemove={removeFromCart}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <aside style={S.summary}>
                                <h3 style={S.summaryTitle}>Order Summary</h3>

                                <div style={S.summaryRow}>
                                    <span style={S.summaryLabel}>Subtotal ({itemCount} items)</span>
                                    <span style={S.summaryValue}>${fmt(cartTotal)}</span>
                                </div>
                                <div style={S.summaryRow}>
                                    <span style={S.summaryLabel}>Shipping</span>
                                    <span style={{ ...S.summaryValue, color: "#2C6E49", fontWeight: 600 }}>Free</span>
                                </div>

                                <div style={S.summaryDivider} />

                                <div style={S.summaryRow}>
                                    <span style={S.summaryTotalLabel}>Total</span>
                                    <span style={S.summaryTotalValue}>${fmt(cartTotal)}</span>
                                </div>

                                {checkoutError && (
                                    <div style={S.errorBox}>{checkoutError}</div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    style={{
                                        ...S.checkoutBtn,
                                        opacity: checkoutLoading ? 0.7 : 1,
                                        cursor: checkoutLoading ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {checkoutLoading ? "Placing Order..." : "Proceed to Checkout"}
                                </button>

                                <Link to="/products" style={S.continueLink}>
                                    ← Continue Shopping
                                </Link>
                            </aside>
                        </div>
                    )
                )}

                {/* ORDERS TAB */}
                {tab === "orders" && (
                    <div>
                        {!token ? (
                            <div style={S.empty}>
                                <p style={S.emptyTitle}>Sign in to view orders</p>
                                <Link to="/signin" style={S.browseBtn}>Sign In</Link>
                            </div>
                        ) : ordersLoading ? (
                            <div style={S.loadingText}>LOADING ORDERS...</div>
                        ) : orders.length === 0 ? (
                            <div style={S.empty}>
                                <h2 style={S.emptyTitle}>No orders yet</h2>
                                <p style={S.emptyDesc}>Once you checkout, your orders will appear here.</p>
                                <Link to="/products" style={S.browseBtn}>Start Shopping</Link>
                            </div>
                        ) : (
                            <div style={S.ordersGrid}>
                                {orders.map((order) => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <Footer />
        </div>
    );
});

CartPage.displayName = "CartPage";
export default CartPage;

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
    page: {
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'Instrument Sans', sans-serif",
    },
    container: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "120px 32px 80px",
    },
    pageHeader: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "40px",
    },
    pageTitle: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "42px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: 0,
        lineHeight: 1.1,
    },
    pageSubtitle: {
        fontSize: "14px",
        color: "#9B9B94",
        margin: "6px 0 0",
    },
    tabRow: { display: "flex", gap: "8px" },
    tab: {
        padding: "10px 20px",
        background: "transparent",
        border: "1px solid #DEDAD4",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#6B6B65",
        cursor: "pointer",
        letterSpacing: "0.05em",
        fontFamily: "'Instrument Sans', sans-serif",
    },
    tabActive: {
        padding: "10px 20px",
        background: "#1A1A18",
        border: "1px solid #1A1A18",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#FAFAF8",
        cursor: "pointer",
        letterSpacing: "0.05em",
        fontFamily: "'Instrument Sans', sans-serif",
    },
    successBanner: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#E8F5EE",
        border: "1px solid #B8DFC8",
        borderRadius: "12px",
        padding: "14px 18px",
        marginBottom: "28px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#2C6E49",
    },
    dismissBtn: {
        marginLeft: "auto",
        background: "none",
        border: "none",
        fontSize: "18px",
        color: "#2C6E49",
        cursor: "pointer",
        lineHeight: 1,
    },
    layout: {
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "32px",
        alignItems: "start",
    },
    itemsCol: {},
    itemsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    itemsCount: { fontSize: "13px", fontWeight: 600, color: "#6B6B65", letterSpacing: "0.04em" },
    clearBtn: {
        background: "none",
        border: "none",
        fontSize: "12px",
        fontWeight: 600,
        color: "#B0ADA5",
        cursor: "pointer",
        letterSpacing: "0.04em",
        fontFamily: "'Instrument Sans', sans-serif",
    },
    itemsList: { display: "flex", flexDirection: "column", gap: "12px" },
    item: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        gap: "16px",
        transition: "box-shadow 0.15s",
    },
    itemImg: {
        width: "88px",
        height: "88px",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#F7F6F3",
        flexShrink: 0,
        position: "relative",
    },
    itemImgTag: { width: "100%", height: "100%", objectFit: "cover" },
    itemImgPlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    itemBadge: {
        position: "absolute",
        top: "4px",
        left: "4px",
        background: "#E8321C",
        color: "#FFF",
        fontSize: "9px",
        fontWeight: 700,
        borderRadius: "5px",
        padding: "2px 5px",
        letterSpacing: "0.02em",
    },
    itemBody: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" },
    itemTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" },
    itemCategory: {
        display: "inline-block",
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        color: "#9B9B94",
        background: "#F0EDE8",
        borderRadius: "5px",
        padding: "2px 7px",
        textTransform: "uppercase",
        marginBottom: "4px",
    },
    itemName: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "15px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: 0,
        lineHeight: 1.3,
    },
    removeBtn: {
        background: "#F7F6F3",
        border: "none",
        borderRadius: "8px",
        width: "28px",
        height: "28px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9B9B94",
        flexShrink: 0,
    },
    itemBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    qtyRow: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #ECEAE4",
        borderRadius: "8px",
        overflow: "hidden",
    },
    qBtn: (disabled) => ({
        width: "28px",
        height: "28px",
        border: "none",
        background: disabled ? "#F7F6F3" : "#FFF",
        color: disabled ? "#C4BFB4" : "#1A1A18",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }),
    qVal: {
        minWidth: "30px",
        textAlign: "center",
        fontSize: "13px",
        fontWeight: 600,
        color: "#1A1A18",
        borderLeft: "1px solid #ECEAE4",
        borderRight: "1px solid #ECEAE4",
        lineHeight: "28px",
    },
    itemPrices: { textAlign: "right" },
    itemTotal: { display: "block", fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#1A1A18" },
    itemOriginal: { display: "block", fontSize: "11px", color: "#C4BFB4", textDecoration: "line-through" },
    itemUnit: { display: "block", fontSize: "11px", color: "#B0ADA5" },
    summary: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "20px",
        padding: "28px",
        position: "sticky",
        top: "96px",
    },
    summaryTitle: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "22px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: "0 0 20px",
    },
    summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
    summaryLabel: { fontSize: "13px", color: "#6B6B65" },
    summaryValue: { fontSize: "13px", fontWeight: 600, color: "#1A1A18" },
    summaryDivider: { borderTop: "1px solid #ECEAE4", margin: "16px 0" },
    summaryTotalLabel: { fontSize: "15px", fontWeight: 600, color: "#1A1A18" },
    summaryTotalValue: { fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#1A1A18" },
    errorBox: {
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: "10px",
        padding: "12px 14px",
        fontSize: "12px",
        color: "#991B1B",
        marginBottom: "14px",
    },
    checkoutBtn: {
        display: "block",
        width: "100%",
        padding: "14px",
        background: "#1A1A18",
        color: "#FAFAF8",
        border: "none",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        marginTop: "18px",
        fontFamily: "'Instrument Sans', sans-serif",
        transition: "background 0.15s",
        textAlign: "center",
    },
    continueLink: {
        display: "block",
        textAlign: "center",
        marginTop: "14px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#9B9B94",
        textDecoration: "none",
        letterSpacing: "0.03em",
    },
    empty: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "20px",
        padding: "80px 40px",
        textAlign: "center",
    },
    emptyIcon: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "#F7F6F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
    },
    emptyTitle: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "28px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: "0 0 8px",
    },
    emptyDesc: { fontSize: "14px", color: "#9B9B94", margin: "0 0 28px" },
    browseBtn: {
        display: "inline-block",
        padding: "12px 28px",
        background: "#1A1A18",
        color: "#FAFAF8",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textDecoration: "none",
        fontFamily: "'Instrument Sans', sans-serif",
    },
    loadingText: {
        textAlign: "center",
        padding: "80px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#C4BFB4",
        letterSpacing: "0.1em",
    },
    ordersGrid: { display: "flex", flexDirection: "column", gap: "16px" },
    orderCard: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "16px",
        padding: "20px 24px",
    },
    orderHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" },
    orderShop: { fontFamily: "'DM Serif Display', serif", fontSize: "17px", color: "#1A1A18", marginBottom: "2px" },
    orderId: { fontSize: "11px", color: "#B0ADA5", fontWeight: 600, letterSpacing: "0.06em" },
    orderStatus: (status) => ({
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "4px 10px",
        borderRadius: "8px",
        background: status === "PLACED" ? "#E8F5EE" : status === "DELIVERED" ? "#F0EDE8" : "#FEF2F2",
        color: status === "PLACED" ? "#2C6E49" : status === "DELIVERED" ? "#6B6B65" : "#991B1B",
    }),
    orderItems: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" },
    orderItem: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    orderItemName: { fontSize: "13px", color: "#2C2C28", fontWeight: 500 },
    orderItemDetail: { fontSize: "12px", color: "#9B9B94" },
    orderFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "14px",
        borderTop: "1px solid #ECEAE4",
    },
    orderDate: { fontSize: "11px", color: "#B0ADA5" },
    orderTotal: { fontSize: "14px", fontWeight: 700, color: "#1A1A18" },
};