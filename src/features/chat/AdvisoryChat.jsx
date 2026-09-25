import { useState } from "react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Feedback";
import { LockIcon, SendIcon, StoreIcon } from "../../components/ui/icons";
import * as chatApi from "../../api/chat";

const AdvisoryChat = ({ isLocked, onUpgrade, userName, userImage }) => {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I can help you with pricing, listings, and shop strategy. What's on your mind?" }]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || isLocked) return;
    const userMessage = { role: "user", content: draft.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setLoading(true);
    try {
      const data = await chatApi.sendAdvisoryChatMessage(userMessage.content);
      setMessages((prev) => [...prev, { role: "assistant", content: data?.message || "…" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't respond just now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-[13.5px] font-semibold text-ink">AI shop assistant</h3>
        <p className="text-[11.5px] text-ink-muted">Ask for pricing, listing, or growth advice.</p>
      </div>

      <div className={`thin-scroll flex-1 space-y-3 overflow-y-auto p-4 ${isLocked ? "pointer-events-none blur-[2px]" : ""}`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-secondary">
                <StoreIcon size={13} />
              </span>
            )}
            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-[13px] ${m.role === "user" ? "bg-ink text-ink-inverse" : "bg-surface-sunken text-ink"}`}>{m.content}</div>
            {m.role === "user" && <Avatar src={userImage} name={userName} size="sm" />}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-ink-muted">
            <Spinner size={14} /> <span className="text-[12px]">Thinking…</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isLocked}
          placeholder="Ask the assistant…"
          className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-[13px] focus-ring focus:border-ink-secondary disabled:bg-surface-sunken"
        />
        <button type="submit" disabled={!draft.trim() || isLocked} className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-ink-inverse disabled:opacity-50">
          <SendIcon size={14} />
        </button>
      </form>

      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/70 px-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-ink-inverse">
            <LockIcon size={18} />
          </span>
          <p className="text-[13.5px] font-semibold text-ink">Premium feature</p>
          <p className="max-w-xs text-[12.5px] text-ink-secondary">Upgrade to Premium to unlock the AI shop assistant.</p>
          <Button size="sm" onClick={onUpgrade}>
            Upgrade plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvisoryChat;
