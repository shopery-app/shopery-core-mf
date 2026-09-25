import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { getConversation } from "../api/chat";
import { getAccessToken } from "../utils/tokenService";
import { isJwtExpired } from "../utils/jwt";
import { buildWsUrl } from "../utils/ws";

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
    const token = getAccessToken();
    if (!token || isJwtExpired(token)) {
      setMessages([]);
      return;
    }
    try {
      setLoading(true);
      const data = await getConversation(targetId);
      setMessages(data ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const token = getAccessToken();
    if (!token || isJwtExpired(token)) {
      setConnected(false);
      return;
    }

    const client = new Client({
      brokerURL: buildWsUrl(token),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/user/queue/messages", (frame) => {
          const msg = JSON.parse(frame.body);
          const current = otherUserIdRef.current;
          if (msg.senderId !== current && msg.receiverId !== current) return;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
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
      if (!clientRef.current?.connected || !content.trim() || !otherUserId) return;
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ receiverId: otherUserId, content: content.trim() }),
      });
    },
    [otherUserId],
  );

  return { messages, sendMessage, connected, loading };
}
