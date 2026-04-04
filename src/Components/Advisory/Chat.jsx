import { useState, useRef, useEffect } from "react";
import { RiSendPlane2Fill, RiLockFill, RiSparklingFill } from "react-icons/ri";
import { apiURL } from "../../Backend/Api/api";

import botAvatarImg from "../../Images/chat-bot.jpg";

export default function Chat({ isLocked = false, onUpgrade, userImage, userName }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your AI Merchant Assistant. I can help you analyze sales, write product descriptions, or resolve customer issues. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  const renderUserAvatar = () => {
    if (userImage) {
      return (
          <img
              src={userImage}
              className="h-8 w-8 rounded-full shadow-sm object-cover"
              alt="User"
              onError={(e) => { e.target.src = ""; }} // Fallback if URL is broken
          />
      );
    }
    const initial = userName ? userName.charAt(0).toUpperCase() : "M";
    return (
        <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initial}
        </div>
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isLocked) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiURL}/users/me/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: data?.data?.message || "I apologize, but I'm having trouble connecting to the brain. Please try again."
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "System error. Please check your connection. ⚠️" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="relative w-full max-w-5xl mx-auto">
        {/* ─── LOCKED OVERLAY ─── */}
        {isLocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/40 backdrop-blur-[6px] border-2 border-dashed border-indigo-200 p-6 text-center transition-all">
              <div className="bg-indigo-600 p-4 rounded-full shadow-xl mb-4 text-white animate-pulse">
                <RiLockFill size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                AI Support is Locked <RiSparklingFill className="text-indigo-500" />
              </h3>
              <p className="text-gray-600 mt-2 max-w-sm font-medium">
                Join our <span className="text-indigo-600 font-bold">Premium Plan</span> to unlock 24/7 AI assistance and smart shop insights.
              </p>
              <button
                  onClick={onUpgrade}
                  className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
              >
                Upgrade Now to Unlock
              </button>
            </div>
        )}

        {/* ─── CHAT INTERFACE ─── */}
        <div className={`flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all ${isLocked ? 'grayscale-[0.5] opacity-50' : ''}`}>

          {/* Header */}
          <div className="border-b bg-gradient-to-r from-gray-50 to-white p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={botAvatarImg} alt="AI" className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Business Bot</h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Assistant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={chatRef} className="flex-1 space-y-6 overflow-y-auto p-6 bg-[#f8fafc] scrollbar-thin">
            {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Conditional Avatar Display */}
                  {msg.sender === "bot" ? (
                      <img src={botAvatarImg} className="h-8 w-8 rounded-full shadow-sm object-cover" alt="bot" />
                  ) : (
                      renderUserAvatar()
                  )}

                  <div className={`max-w-[75%] px-4 py-3 shadow-sm transition-all ${
                      msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-2xl rounded-tr-none font-medium"
                          : "bg-white text-gray-700 rounded-2xl rounded-tl-none border border-gray-100 leading-relaxed"
                  }`}>
                    {msg.text}
                  </div>
                </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
                <div className="flex items-start gap-3">
                  <img src={botAvatarImg} className="h-8 w-8 rounded-full object-cover" alt="bot" />
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 flex gap-2 items-center shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={sendMessage} className="relative group">
              <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || isLocked}
                  placeholder={isLocked ? "Premium membership required..." : "Type your question here..."}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pl-5 pr-14 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-0"
              />
              <button
                  type="submit"
                  disabled={loading || !input.trim() || isLocked}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-90"
              >
                <RiSendPlane2Fill size={22} />
              </button>
            </form>
            <div className="mt-3 flex justify-center items-center gap-4 text-[10px] text-gray-400 font-medium">
              <span className="flex items-center gap-1"><RiSparklingFill /> Advanced AI Model</span>
              <span>|</span>
              <span>Encrypted Connection</span>
            </div>
          </div>
        </div>
      </div>
  );
}