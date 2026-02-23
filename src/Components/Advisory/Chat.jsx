import { useState, useRef, useEffect } from "react";
import { RiSendPlane2Fill } from "react-icons/ri";
import { apiURL } from "../../Backend/Api/api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! How can I help you today?" }
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
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${apiURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg.text,
        }),
      });
      const data = await res.json();
      const botMsg = {
        sender: "bot",
        text: data?.data?.message || "No response received 😕",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "An error occurred ⚠️" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
   
    <div className="flex w-full justify-center bg-gray-50 pt-10 pb-20 px-4">
      
      <div className="flex h-[60vh] min-h-[500px] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-gray-300 bg-white shadow-2xl">
        
        <div className="border-b bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <h2 className="text-xl font-bold tracking-tight text-gray-800">Merchant Support</h2>
          </div>
        </div>

        
        <div
          ref={chatRef}
          className="flex-1 space-y-6 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 text-[16px] leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 px-2 text-sm font-medium text-gray-400">
              <span className="flex space-x-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:0.4s]"></span>
              </span>
              Typing...
            </div>
          )}
        </div>

        <div className="border-t bg-white p-6">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your issue here..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-5 pl-6 pr-16 text-md transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-90 disabled:opacity-40"
            >
              <RiSendPlane2Fill className="text-2xl" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}