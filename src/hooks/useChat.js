import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { apiURL } from "../Backend/Api/api";
import { isJwtExpired } from "../utils/jwt";

const buildWsUrl = (token) => {
    const base = apiURL
        .replace("/api/v1", "/ws")
        .replace(/^http/, "ws");
    return `${base}?token=${token}`;
};

export default function useChat(currentUserId, otherUserId) {
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const clientRef = useRef(null);
    const otherUserIdRef = useRef(otherUserId);

    useEffect(() => {
        otherUserIdRef.current = otherUserId;
    }, [otherUserId]);

    const loadHistory = useCallback(async (targetId) => {
        if (!targetId) return;

        const token = localStorage.getItem("accessToken");
        if (!token || isJwtExpired(token)) {
            setMessages([]);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`${apiURL}/chat/conversation/${targetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data?.data ?? []);
        } catch {
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            setConnected(false);
            return;
        }

        if (isJwtExpired(token)) {
            console.warn("WS connect skipped: access token expired");
            setConnected(false);
            return;
        }

        const client = new Client({
            brokerURL: buildWsUrl(token),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => console.log("STOMP:", str),
            reconnectDelay: 3000,

            onConnect: () => {
                console.log("STOMP CONNECTED");
                setConnected(true);

                client.subscribe("/user/queue/messages", (frame) => {
                    const msg = JSON.parse(frame.body);
                    const current = otherUserIdRef.current;
                    const relevant =
                        msg.senderId === current || msg.receiverId === current;

                    if (!relevant) return;

                    setMessages((prev) => {
                        const exists = prev.some((m) => m.id === msg.id);
                        return exists ? prev : [...prev, msg];
                    });
                });
            },

            onDisconnect: () => {
                console.log("STOMP DISCONNECTED");
                setConnected(false);
            },

            onStompError: (frame) => {
                console.error("Broker reported error:", frame.headers["message"]);
                console.error("Details:", frame.body);
            },

            onWebSocketError: (event) => {
                console.error("WebSocket error:", event);
            },

            onWebSocketClose: (event) => {
                console.error("WebSocket closed:", event);
                setConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [currentUserId]);

    useEffect(() => {
        if (otherUserId) {
            setMessages([]);
            loadHistory(otherUserId);
        }
    }, [otherUserId, loadHistory]);

    const sendMessage = useCallback(
        (content) => {
            console.log("sendMessage called", {
                connected: clientRef.current?.connected,
                content,
                trimmed: content?.trim(),
                otherUserId,
            });

            if (!clientRef.current?.connected) return;
            if (!content.trim()) return;
            if (!otherUserId) return;

            clientRef.current.publish({
                destination: "/app/chat.send",
                body: JSON.stringify({
                    receiverId: otherUserId,
                    content: content.trim(),
                }),
            });
        },
        [otherUserId]
    );

    return { messages, sendMessage, connected, loading };
}