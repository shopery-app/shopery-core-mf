import { useState, useRef, useEffect } from "react";
import { RiSendPlane2Fill } from "react-icons/ri";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Salam! Necə kömək edə bilərəm?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data?.data?.message || "Cavab alınmadı 😕",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xəta baş verdi ⚠️" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white">
      <div className="border-b p-4 font-semibold">
        🤖 Merchant Chatbot
      </div>

      <div
        ref={chatRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-400">Bot yazır...</div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 border-t p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white"
        >
          <RiSendPlane2Fill />
        </button>
      </form>
    </div>
  );
}
