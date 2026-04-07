// SellerInbox.jsx
import React, {
    useState, useEffect, useRef, useCallback, memo, useReducer,
} from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import { apiURL } from "../../Backend/Api/api";

const buildWsUrl = (token) =>
    apiURL
        .replace("/api/v1", "/ws")
        .replace(/^http/, "ws") + `?token=${token}`;

const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];
const colorFor = (id = "") =>
    COLORS[parseInt((id ?? "").replace(/-/g, "").slice(0, 8), 16) % COLORS.length];

const initials = (name = "") =>
    (name || "?").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const fmtTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = d.toDateString() === new Date(now - 86400000).toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isYesterday) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const fmtMsgTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

/* ── Message bubble ──────────────────────────────────────── */
const Bubble = memo(({ msg, isMe }) => (
    <div style={{
        display: "flex", flexDirection: "column",
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
            fontSize: 13.5, maxWidth: "74%", lineHeight: 1.5, wordBreak: "break-word",
            boxShadow: isMe ? "0 2px 8px rgba(16,185,129,0.22)" : "0 1px 3px rgba(0,0,0,0.05)",
        }}>
            {msg.content}
        </div>
        <span style={{
            fontSize: 10, color: "var(--color-text-tertiary, #9ca3af)",
            marginTop: 3, padding: "0 4px", display: "flex", alignItems: "center", gap: 3,
        }}>
            {fmtMsgTime(msg.createdAt)}
            {isMe && <span style={{ color: "#10b981" }}>✓✓</span>}
        </span>
    </div>
));
Bubble.displayName = "Bubble";

/* ── Date divider ────────────────────────────────────────── */
const DateDivider = memo(({ label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 8px" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
        <span style={{
            fontSize: 10.5, color: "var(--color-text-tertiary, #9ca3af)",
            background: "rgba(0,0,0,0.04)", padding: "2px 10px", borderRadius: 99, whiteSpace: "nowrap",
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

/* ── Conversation list item ──────────────────────────────── */
const ConversationItem = memo(({ convo, isActive, unread, onClick }) => {
    const preview = convo.lastMessage?.content ?? "Start a conversation";
    const name = convo.buyerName || "Customer";
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex", gap: 11, padding: "12px 14px", cursor: "pointer",
                borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                background: isActive
                    ? "linear-gradient(135deg, #f0fdf4, #ecfdf5)"
                    : "transparent",
                transition: "background 0.12s", alignItems: "center",
                borderLeft: isActive ? "3px solid #10b981" : "3px solid transparent",
            }}
        >
            <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: colorFor(convo.buyerId),
                    color: "white", fontSize: 14, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}>
                    {initials(name)}
                </div>
                {unread > 0 && (
                    <div style={{
                        position: "absolute", top: -2, right: -2,
                        minWidth: 18, height: 18, borderRadius: 99,
                        background: "#ef4444", border: "2px solid white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: "white", fontWeight: 700, padding: "0 3px",
                    }}>
                        {unread > 9 ? "9+" : unread}
                    </div>
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <p style={{
                        fontWeight: unread > 0 ? 600 : 500,
                        fontSize: 13.5, color: "var(--color-text-primary, #111)", margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: "60%",
                    }}>{name}</p>
                    {convo.lastMessage?.createdAt && (
                        <span style={{ fontSize: 10.5, color: "var(--color-text-tertiary, #9ca3af)", flexShrink: 0 }}>
                            {fmtTime(convo.lastMessage.createdAt)}
                        </span>
                    )}
                </div>
                <p style={{
                    fontSize: 12, color: unread > 0 ? "#374151" : "var(--color-text-secondary, #6b7280)",
                    margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: unread > 0 ? 500 : 400,
                }}>
                    {preview}
                </p>
            </div>
        </div>
    );
});
ConversationItem.displayName = "ConversationItem";

/* ── Unread reducer ──────────────────────────────────────── */
const unreadReducer = (state, action) => {
    switch (action.type) {
        case "INCREMENT":
            return { ...state, [action.userId]: (state[action.userId] || 0) + 1 };
        case "CLEAR":
            return { ...state, [action.userId]: 0 };
        default:
            return state;
    }
};

/* ── Main SellerInbox ────────────────────────────────────── */
const SellerInbox = memo(({ currentUser }) => {
    const [conversations, setConversations] = useState([]);
    const [activeUserId, setActiveUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [unread, dispatchUnread] = useReducer(unreadReducer, {});
    const [optimisticMsgs, setOptimisticMsgs] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const clientRef = useRef(null);

    const allMessages = [...messages, ...optimisticMsgs.filter(
        (o) => !messages.some((m) => m.content === o.content && m.senderId === o.senderId)
    )];
    const grouped = groupByDate(allMessages);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages.length]);

    useEffect(() => {
        if (messages.length) setOptimisticMsgs([]);
    }, [messages.length]);

    const loadConversations = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        try {
            setLoadingConvos(true);
            const res = await axios.get(`${apiURL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const list = res.data?.data ?? [];
            setConversations(list);
            return list;
        } catch {
            setConversations([]);
            return [];
        } finally {
            setLoadingConvos(false);
        }
    }, []);

    const loadMessages = useCallback(async (buyerId) => {
        const token = localStorage.getItem("accessToken");
        try {
            setLoadingMsgs(true);
            const res = await axios.get(`${apiURL}/chat/conversation/${buyerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data?.data ?? []);
        } catch {
            setMessages([]);
        } finally {
            setLoadingMsgs(false);
        }
    }, []);

    // Connect WebSocket ONCE
    useEffect(() => {
        if (!currentUser?.id) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const client = new Client({
            brokerURL: buildWsUrl(token),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => console.log("STOMP:", str),
            onConnect: () => {
                console.log("STOMP CONNECTED");
                setConnected(true);

                client.subscribe("/user/queue/messages", (frame) => {
                    const msg = JSON.parse(frame.body);
                    const senderId = msg.senderId;

                    setActiveUserId((activeId) => {
                        if (activeId === senderId) {
                            setMessages((prev) => {
                                const exists = prev.some((m) => m.id === msg.id);
                                return exists ? prev : [...prev, msg];
                            });
                        } else {
                            dispatchUnread({ type: "INCREMENT", userId: senderId });
                        }
                        return activeId;
                    });

                    setConversations((prev) => {
                        const exists = prev.find((c) => c.buyerId === senderId);
                        if (exists) {
                            return prev.map((c) =>
                                c.buyerId === senderId ? { ...c, lastMessage: msg } : c
                            );
                        }
                        loadConversations();
                        return prev;
                    });
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (frame) => {
                console.error("Broker reported error:", frame.headers["message"]);
                console.error("Details:", frame.body);
            },
            onWebSocketClose: (event) => {
                console.error("WebSocket closed:", event);
                setConnected(false);
            },
            reconnectDelay: 3000,
        });

        client.activate();
        clientRef.current = client;

        return () => client.deactivate();
    }, [currentUser?.id, loadConversations]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    const openConversation = useCallback((buyerId) => {
        setActiveUserId(buyerId);
        setMessages([]);
        setOptimisticMsgs([]);
        dispatchUnread({ type: "CLEAR", userId: buyerId });
        loadMessages(buyerId);
        setTimeout(() => inputRef.current?.focus(), 150);
    }, [loadMessages]);

    const handleSend = useCallback(() => {
        const text = input.trim();
        if (!text || !clientRef.current?.connected || !activeUserId) return;
        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({ receiverId: activeUserId, content: text }),
        });
        setOptimisticMsgs((prev) => [...prev, {
            id: `opt-${Date.now()}`,
            senderId: currentUser.id,
            receiverId: activeUserId,
            content: text,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        }]);
        setConversations((prev) => prev.map((c) =>
            c.buyerId === activeUserId
                ? { ...c, lastMessage: { content: text, createdAt: new Date().toISOString() } }
                : c
        ));
        setInput("");
    }, [input, activeUserId, currentUser?.id]);

    const handleKey = useCallback(
        (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } },
        [handleSend]
    );

    const activeConvo = conversations.find((c) => c.buyerId === activeUserId);
    const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

    return (
        <div style={{
            background: "var(--color-background-primary, #fff)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            height: 520,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}>
            {/* ── Sidebar ─────────────────────────────────── */}
            <div style={{
                width: 256, flexShrink: 0,
                borderRight: "1px solid rgba(0,0,0,0.06)",
                display: "flex", flexDirection: "column",
                background: "var(--color-background-primary, #fff)",
            }}>
                {/* Header */}
                <div style={{
                    padding: "16px 16px 12px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <i className="fa-solid fa-inbox" style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }} />
                            <p style={{ fontWeight: 700, fontSize: 15, color: "#fff", margin: 0 }}>Messages</p>
                        </div>
                        {totalUnread > 0 && (
                            <span style={{
                                background: "#ef4444",
                                color: "white", fontSize: 10, fontWeight: 700,
                                padding: "2px 8px", borderRadius: 99,
                                boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
                            }}>
                                {totalUnread} new
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                        <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: connected ? "#a7f3d0" : "rgba(255,255,255,0.4)",
                            boxShadow: connected ? "0 0 0 2px rgba(167,243,208,0.4)" : "none",
                        }} />
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", margin: 0 }}>
                            {connected ? "Connected" : "Connecting..."}
                        </p>
                    </div>
                </div>

                {/* Conversation list */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loadingConvos ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 48, gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                border: "3px solid #d1fae5", borderTopColor: "#10b981",
                                animation: "spin 0.8s linear infinite",
                            }} />
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>Loading...</span>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "48px 20px" }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%",
                                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 12px",
                                border: "2px dashed #86efac",
                            }}>
                                <i className="fa-solid fa-inbox" style={{ fontSize: 22, color: "#10b981" }} />
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No messages yet</p>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Customers will appear here</p>
                        </div>
                    ) : (
                        conversations.map((c) => (
                            <ConversationItem
                                key={c.buyerId}
                                convo={c}
                                isActive={c.buyerId === activeUserId}
                                unread={unread[c.buyerId] || 0}
                                onClick={() => openConversation(c.buyerId)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Chat panel ──────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {activeUserId ? (
                    <>
                        {/* Chat header */}
                        <div style={{
                            padding: "12px 18px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            display: "flex", alignItems: "center", gap: 12,
                            background: "var(--color-background-primary, #fff)",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: "50%",
                                background: colorFor(activeUserId),
                                color: "white", fontSize: 13, fontWeight: 600,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                            }}>
                                {initials(activeConvo?.buyerName)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary, #111)", margin: 0 }}>
                                    {activeConvo?.buyerName || "Customer"}
                                </p>
                                <p style={{ fontSize: 11, color: "#10b981", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{
                                        display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                                        background: "#10b981",
                                    }} />
                                    Buyer
                                </p>
                            </div>
                        </div>

                        {/* Messages area */}
                        <div style={{
                            flex: 1, overflowY: "auto", padding: "16px 16px 8px",
                            background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        }}>
                            {loadingMsgs ? (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        border: "3px solid #d1fae5", borderTopColor: "#10b981",
                                        animation: "spin 0.8s linear infinite",
                                    }} />
                                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Loading messages...</span>
                                </div>
                            ) : grouped.length === 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                                    <div style={{
                                        width: 60, height: 60, borderRadius: "50%",
                                        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        border: "2px dashed #86efac",
                                    }}>
                                        <i className="fa-solid fa-comment-dots" style={{ fontSize: 24, color: "#10b981" }} />
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No messages yet</p>
                                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Start the conversation</p>
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

                        {/* Input */}
                        <div style={{
                            display: "flex", gap: 10, padding: "12px 14px",
                            borderTop: "1px solid rgba(0,0,0,0.06)",
                            background: "var(--color-background-primary, #fff)",
                            alignItems: "center",
                        }}>
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Type a reply..."
                                style={{
                                    flex: 1,
                                    border: "1.5px solid",
                                    borderColor: input ? "#10b981" : "rgba(0,0,0,0.1)",
                                    borderRadius: 24,
                                    padding: "10px 18px",
                                    fontSize: 13,
                                    background: "var(--color-background-secondary, #f9fafb)",
                                    color: "var(--color-text-primary, #111)",
                                    outline: "none",
                                    transition: "border-color 0.15s, box-shadow 0.15s",
                                    boxShadow: input ? "0 0 0 3px rgba(16,185,129,0.1)" : "none",
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || !connected}
                                style={{
                                    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                                    background: input.trim() && connected
                                        ? "linear-gradient(135deg, #10b981, #059669)"
                                        : "rgba(0,0,0,0.05)",
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
                                    color: input.trim() && connected ? "#fff" : "#9ca3af",
                                    transform: "translateX(1px)",
                                }} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        flexDirection: "column", gap: 14,
                        background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%",
                            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "3px dashed #86efac",
                        }}>
                            <i className="fa-solid fa-comment-dots" style={{ fontSize: 34, color: "#10b981" }} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>
                                Your Inbox
                            </p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                                Select a conversation to start replying
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
});

SellerInbox.displayName = "SellerInbox";
export default SellerInbox;