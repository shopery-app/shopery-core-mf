// BuyerChat.jsx
import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import useChat from "../../hooks/useChat";

const initials = (name = "") =>
    (name || "?").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];
const colorFor = (id = "") =>
    id ? COLORS[parseInt((id || "").replace(/-/g, "").slice(0, 8), 16) % COLORS.length] : COLORS[0];

const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const Bubble = memo(({ msg, isMe }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
        marginBottom: 6,
    }}>
        <div style={{
            padding: "9px 14px",
            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isMe
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "rgba(0,0,0,0.05)",
            color: isMe ? "#fff" : "var(--color-text-primary, #111)",
            fontSize: 14,
            maxWidth: "72%",
            lineHeight: 1.5,
            wordBreak: "break-word",
            boxShadow: isMe
                ? "0 2px 8px rgba(16,185,129,0.25)"
                : "0 1px 3px rgba(0,0,0,0.06)",
        }}>
            {msg.content}
        </div>
        <span style={{
            fontSize: 10,
            color: "var(--color-text-tertiary, #9ca3af)",
            marginTop: 3,
            padding: "0 4px",
        }}>
            {fmtTime(msg.createdAt)}
            {isMe && (
                <span style={{ marginLeft: 4, color: "#10b981" }}>✓✓</span>
            )}
        </span>
    </div>
));
Bubble.displayName = "Bubble";

/* ---------- tiny date divider ---------- */
const DateDivider = memo(({ label }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 10, margin: "12px 0 8px",
    }}>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
        <span style={{
            fontSize: 11, color: "var(--color-text-tertiary, #9ca3af)",
            background: "rgba(0,0,0,0.04)", padding: "2px 10px", borderRadius: 99,
            whiteSpace: "nowrap",
        }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
    </div>
));
DateDivider.displayName = "DateDivider";

const groupByDate = (messages) => {
    const groups = [];
    let lastDate = null;
    messages.forEach((msg) => {
        const d = msg.createdAt ? new Date(msg.createdAt).toDateString() : "Unknown";
        if (d !== lastDate) {
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const label = d === today ? "Today" : d === yesterday ? "Yesterday" : d;
            groups.push({ type: "divider", label, key: `div-${d}` });
            lastDate = d;
        }
        groups.push({ type: "msg", ...msg });
    });
    return groups;
};

const BuyerChat = memo(({ sellerId, shopName, currentUser }) => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [optimisticMsgs, setOptimisticMsgs] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const { messages, sendMessage, connected, loading } = useChat(
        currentUser?.id,
        sellerId
    );

    const allMessages = [...messages, ...optimisticMsgs.filter(
        (o) => !messages.some((m) => m.content === o.content && m.senderId === o.senderId)
    )];

    const grouped = groupByDate(allMessages);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages.length, open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 100);
    }, [open]);

    const handleSend = useCallback(() => {
        const text = input.trim();
        if (!text || !connected) return;
        console.log("handleSend clicked", {
            text,
            connected,
            currentUserId: currentUser?.id,
            sellerId,
        });
        sendMessage(text);
        // optimistic
        setOptimisticMsgs((prev) => [...prev, {
            id: `opt-${Date.now()}`,
            senderId: currentUser?.id,
            receiverId: sellerId,
            content: text,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        }]);
        setInput("");
    }, [input, connected, sendMessage, currentUser?.id, sellerId]);

    const handleKey = useCallback(
        (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } },
        [handleSend]
    );

    // Clean up optimistic when real message arrives
    useEffect(() => {
        if (messages.length) setOptimisticMsgs([]);
    }, [messages.length]);

    if (!currentUser) {
        return (
            <div style={{
                margin: "32px 0",
                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                border: "1px solid #d1fae5",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "center",
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                }}>
                    <i className="fa-solid fa-comment-dots" style={{ fontSize: 24, color: "#fff" }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 16, color: "#065f46", marginBottom: 6 }}>
                    Chat with {shopName}
                </p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                    <a href="/signin" style={{ color: "#10b981", fontWeight: 500 }}>Sign in</a> to start a conversation
                </p>
            </div>
        );
    }

    const avatarColor = colorFor(sellerId);

    return (
        <div style={{ margin: "32px 0" }}>
            {/* Toggle button */}
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: "100%",
                    background: open
                        ? "linear-gradient(135deg, #059669, #10b981)"
                        : "var(--color-background-primary, #fff)",
                    border: open ? "none" : "1px solid var(--color-border-tertiary, #e5e7eb)",
                    borderRadius: open ? "20px 20px 0 0" : 20,
                    padding: "14px 20px",
                    display: "flex", alignItems: "center", gap: 13,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: open ? "0 -2px 16px rgba(16,185,129,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: open ? "rgba(255,255,255,0.2)" : avatarColor,
                    color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 600, flexShrink: 0,
                    border: open ? "2px solid rgba(255,255,255,0.4)" : "none",
                }}>
                    {initials(shopName)}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                    <p style={{
                        fontWeight: 600, fontSize: 14, margin: 0,
                        color: open ? "#fff" : "var(--color-text-primary, #111)",
                    }}>
                        {shopName}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: connected ? (open ? "#a7f3d0" : "#10b981") : "#9ca3af",
                            animation: connected ? "pulse 2s infinite" : "none",
                        }} />
                        <p style={{
                            fontSize: 11, margin: 0,
                            color: open ? "rgba(255,255,255,0.8)" : (connected ? "#10b981" : "#9ca3af"),
                        }}>
                            {connected ? "Online" : "Connecting..."}
                        </p>
                    </div>
                </div>
                <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: open ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.2s",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}>
                    <i className="fa-solid fa-chevron-down" style={{
                        fontSize: 11,
                        color: open ? "#fff" : "var(--color-text-secondary, #6b7280)",
                    }} />
                </div>
            </button>

            {/* Chat panel */}
            {open && (
                <div style={{
                    background: "var(--color-background-primary, #fff)",
                    border: "1px solid var(--color-border-tertiary, #e5e7eb)",
                    borderTop: "none",
                    borderRadius: "0 0 20px 20px",
                    overflow: "hidden",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                }}>
                    {/* Chat background with subtle pattern */}
                    <div style={{
                        height: 360,
                        overflowY: "auto",
                        padding: "16px 16px 8px",
                        background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}>
                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    border: "3px solid #d1fae5",
                                    borderTopColor: "#10b981",
                                    animation: "spin 0.8s linear infinite",
                                }} />
                                <span style={{ fontSize: 12, color: "#9ca3af" }}>Loading messages...</span>
                            </div>
                        ) : grouped.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "2px dashed #86efac",
                                }}>
                                    <i className="fa-solid fa-comments" style={{ fontSize: 26, color: "#10b981" }} />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Start the conversation</p>
                                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Send a message to {shopName}</p>
                                </div>
                            </div>
                        ) : (
                            grouped.map((item) =>
                                item.type === "divider" ? (
                                    <DateDivider key={item.key} label={item.label} />
                                ) : (
                                    <Bubble
                                        key={item.id}
                                        msg={item}
                                        isMe={item.senderId === currentUser?.id}
                                    />
                                )
                            )
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input row */}
                    <div style={{
                        display: "flex", gap: 10, padding: "12px 14px",
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        background: "var(--color-background-primary, #fff)",
                        alignItems: "flex-end",
                    }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={connected ? "Type a message..." : "Connecting..."}
                                disabled={!connected}
                                style={{
                                    width: "100%",
                                    border: "1.5px solid",
                                    borderColor: input ? "#10b981" : "var(--color-border-secondary, #e5e7eb)",
                                    borderRadius: 24,
                                    padding: "10px 18px",
                                    fontSize: 13,
                                    background: "var(--color-background-secondary, #f9fafb)",
                                    color: "var(--color-text-primary, #111)",
                                    outline: "none",
                                    transition: "border-color 0.15s, box-shadow 0.15s",
                                    boxShadow: input ? "0 0 0 3px rgba(16,185,129,0.1)" : "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || !connected}
                            style={{
                                width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                                background: input.trim() && connected
                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                    : "var(--color-background-secondary, #f3f4f6)",
                                border: "none",
                                cursor: input.trim() && connected ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s",
                                boxShadow: input.trim() && connected ? "0 3px 10px rgba(16,185,129,0.4)" : "none",
                                transform: input.trim() && connected ? "scale(1.05)" : "scale(1)",
                            }}
                        >
                            <i className="fa-solid fa-paper-plane" style={{
                                fontSize: 14,
                                color: input.trim() && connected ? "#fff" : "var(--color-text-tertiary, #9ca3af)",
                                transform: "translateX(1px)",
                            }} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
});

BuyerChat.displayName = "BuyerChat";
export default BuyerChat;