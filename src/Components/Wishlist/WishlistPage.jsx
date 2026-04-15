import React, { memo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";
import Header from "../Header";
import Footer from "../Footer";

const fmt = (n) => Number(n || 0).toFixed(2);

const WishlistPage = memo(() => {
    const navigate = useNavigate();
    const { items, loading, removeFromWishlist, clearWishlist, loadWishlist } = useWishlist();
    const { addToCart, isItemInCart } = useCart();
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (!token) navigate("/signin");
        else loadWishlist();
    }, [token]);

    const handleAddToCart = async (product) => {
        await addToCart(product.id, 1, {
            id: product.id,
            productName: product.productName,
            imageUrl: product.imageUrl,
            currentPrice: product.currentPrice,
            originalPrice: product.discountDto?.originalPrice,
            discountPct: product.discountDto?.percentage,
        });
    };

    return (
        <div style={S.page}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
            <Header />
            <div style={S.container}>
                <div style={S.pageHeader}>
                    <div>
                        <h1 style={S.title}>Wishlist</h1>
                        <p style={S.subtitle}>
                            {items.length > 0 ? `${items.length} saved item${items.length !== 1 ? "s" : ""}` : "Nothing saved yet"}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <button onClick={clearWishlist} style={S.clearBtn}>Clear All</button>
                    )}
                </div>

                {loading ? (
                    <div style={S.loading}>LOADING WISHLIST...</div>
                ) : items.length === 0 ? (
                    <div style={S.empty}>
                        <div style={S.emptyIcon}>
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <circle cx="22" cy="22" r="21" stroke="#DEDAD4" strokeWidth="1.5"/>
                                <path d="M30.84 14.61a5.5 5.5 0 0 0-7.78 0L22 15.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L22 31.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#C4BFB4" strokeWidth="1.5" fill="none"/>
                            </svg>
                        </div>
                        <h2 style={S.emptyTitle}>Your wishlist is empty</h2>
                        <p style={S.emptyDesc}>Save products you love by clicking the heart icon.</p>
                        <Link to="/products" style={S.browseBtn}>Browse Products</Link>
                    </div>
                ) : (
                    <div style={S.grid}>
                        {items.map((product) => {
                            const discountPct = product.discountDto?.percentage || 0;
                            const originalPrice = Number(product.discountDto?.originalPrice || 0);
                            const currentPrice = Number(product.currentPrice || 0);
                            const inCart = isItemInCart(product.id);

                            return (
                                <div key={product.id} style={S.card}>
                                    {/* Image */}
                                    <div style={S.imgWrap}>
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.productName} style={S.img} loading="lazy"/>
                                        ) : (
                                            <div style={S.imgPlaceholder}>
                                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="22" height="20" rx="3" stroke="#C4BFB4" strokeWidth="1.5"/><circle cx="10" cy="12" r="2.5" stroke="#C4BFB4" strokeWidth="1.5"/><path d="M3 22l6-5 5 5 5-4 6 5" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                                            </div>
                                        )}
                                        {discountPct > 0 && (
                                            <div style={S.discountBadge}>−{discountPct}%</div>
                                        )}
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            style={S.removeWishBtn}
                                            title="Remove from wishlist"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div style={S.cardBody}>
                                        <h3 style={S.productName}>{product.productName}</h3>
                                        {product.description && (
                                            <p style={S.productDesc}>{product.description}</p>
                                        )}

                                        <div style={S.priceRow}>
                                            <span style={S.price}>${fmt(currentPrice)}</span>
                                            {originalPrice > currentPrice && (
                                                <span style={S.originalPrice}>${fmt(originalPrice)}</span>
                                            )}
                                        </div>

                                        <div style={S.cardActions}>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                style={{
                                                    ...S.addCartBtn,
                                                    background: inCart ? "#2C6E49" : "#1A1A18",
                                                }}
                                            >
                                                {inCart ? "✓ In Cart" : "Add to Cart"}
                                            </button>
                                            <button
                                                onClick={() => removeFromWishlist(product.id)}
                                                style={S.removeBtn}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
});

WishlistPage.displayName = "WishlistPage";
export default WishlistPage;

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
    page: { minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Instrument Sans', sans-serif" },
    container: { maxWidth: "1200px", margin: "0 auto", padding: "120px 32px 80px" },
    pageHeader: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "40px",
    },
    title: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "42px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: 0,
        lineHeight: 1.1,
    },
    subtitle: { fontSize: "14px", color: "#9B9B94", margin: "6px 0 0" },
    clearBtn: {
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
    loading: { textAlign: "center", padding: "80px", fontSize: "12px", fontWeight: 600, color: "#C4BFB4", letterSpacing: "0.1em" },
    empty: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "20px",
        padding: "80px 40px",
        textAlign: "center",
    },
    emptyIcon: {
        width: "76px",
        height: "76px",
        borderRadius: "50%",
        background: "#F7F6F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
    },
    emptyTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "26px", fontWeight: 400, color: "#1A1A18", margin: "0 0 8px" },
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
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" },
    card: {
        background: "#FFFFFF",
        border: "1px solid #ECEAE4",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },
    imgWrap: { position: "relative", paddingBottom: "65%", background: "#F7F6F3", overflow: "hidden" },
    img: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
    imgPlaceholder: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" },
    discountBadge: {
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "#E8321C",
        color: "#FFF",
        fontSize: "10px",
        fontWeight: 700,
        borderRadius: "6px",
        padding: "3px 8px",
        letterSpacing: "0.02em",
    },
    removeWishBtn: {
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "none",
        background: "#1A1A18",
        color: "#FAFAF8",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardBody: { padding: "16px 18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
    productName: {
        fontFamily: "'DM Serif Display', serif",
        fontSize: "16px",
        fontWeight: 400,
        color: "#1A1A18",
        margin: 0,
        lineHeight: 1.3,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    productDesc: {
        fontSize: "12px",
        color: "#9B9B94",
        margin: 0,
        lineHeight: 1.5,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    priceRow: { display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" },
    price: { fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#1A1A18" },
    originalPrice: { fontSize: "13px", color: "#C4BFB4", textDecoration: "line-through" },
    cardActions: { display: "flex", gap: "8px", marginTop: "10px" },
    addCartBtn: {
        flex: 1,
        padding: "10px",
        border: "none",
        borderRadius: "10px",
        color: "#FAFAF8",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.03em",
        fontFamily: "'Instrument Sans', sans-serif",
        transition: "background 0.15s",
    },
    removeBtn: {
        padding: "10px 14px",
        background: "transparent",
        border: "1px solid #ECEAE4",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#9B9B94",
        cursor: "pointer",
        fontFamily: "'Instrument Sans', sans-serif",
    },
};