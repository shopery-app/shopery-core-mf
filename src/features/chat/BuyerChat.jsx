import { useState } from "react";
import useChat from "../../hooks/useChat";
import { isAuthenticated } from "../../utils/auth";
import { MessageIcon, CloseIcon, SendIcon } from "../../components/ui/icons";
import { Spinner } from "../../components/ui/Feedback";
import { formatDate } from "../../utils/format";

const BuyerChat = ({ sellerId, shopName, currentUser }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, connected, loading } = useChat(open ? currentUser?.id : null, sellerId);

  if (!sellerId || !isAuthenticated()) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[420px] w-[340px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-popover">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-[13.5px] font-semibold text-ink">{shopName || "Seller"}</p>
              <p className="text-[11px] text-ink-muted">{connected ? "Online" : "Connecting…"}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink">
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="thin-scroll flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner size={18} />
              </div>
            ) : messages.length === 0 ? (
              <p className="mt-8 text-center text-[12.5px] text-ink-muted">Start the conversation with {shopName || "this seller"}.</p>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === currentUser?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-[13px] ${mine ? "bg-ink text-ink-inverse" : "bg-surface-sunken text-ink"}`}>
                      <p>{m.content}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-ink-inverse/60" : "text-ink-muted"}`}>{formatDate(m.createdAt, { hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-[13px] focus-ring focus:border-ink-secondary"
            />
            <button type="submit" disabled={!draft.trim()} className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-ink-inverse disabled:opacity-50">
              <SendIcon size={14} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-ink-inverse shadow-popover hover:bg-ink/90"
        aria-label="Chat with seller"
      >
        {open ? <CloseIcon size={18} /> : <MessageIcon size={18} />}
      </button>
    </div>
  );
};

export default BuyerChat;
