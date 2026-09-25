import { useEffect, useState } from "react";
import Avatar from "../../components/ui/Avatar";
import { EmptyState, Spinner } from "../../components/ui/Feedback";
import { MessageIcon, SendIcon } from "../../components/ui/icons";
import useChat from "../../hooks/useChat";
import * as chatApi from "../../api/chat";
import { formatDate } from "../../utils/format";

const SellerInbox = ({ currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeBuyerId, setActiveBuyerId] = useState(null);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, connected, loading } = useChat(currentUser?.id, activeBuyerId);

  useEffect(() => {
    chatApi
      .getConversations()
      .then((data) => {
        setConversations(data || []);
        if (data?.[0]) setActiveBuyerId(data[0].buyerId);
      })
      .finally(() => setLoadingConversations(false));
  }, []);

  const activeConversation = conversations.find((c) => c.buyerId === activeBuyerId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
          <MessageIcon size={15} /> Buyer messages
        </h3>
        <span className="text-[11px] text-ink-muted">{connected ? "Connected" : "Connecting…"}</span>
      </div>

      {loadingConversations ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size={20} />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState icon={MessageIcon} title="No conversations yet" description="Messages from buyers will appear here." />
      ) : (
        <div className="flex h-[420px]">
          <div className="thin-scroll w-56 shrink-0 overflow-y-auto border-r border-border">
            {conversations.map((c) => (
              <button
                key={c.buyerId}
                onClick={() => setActiveBuyerId(c.buyerId)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-3 text-left ${c.buyerId === activeBuyerId ? "bg-surface-sunken" : "hover:bg-surface-sunken"}`}
              >
                <Avatar name={c.buyerName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-ink">{c.buyerName}</p>
                  <p className="truncate text-[11px] text-ink-muted">{c.lastMessage?.content}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col">
            <div className="thin-scroll flex-1 space-y-2 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner size={18} />
                </div>
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
                placeholder={`Message ${activeConversation?.buyerName || ""}…`}
                className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-[13px] focus-ring focus:border-ink-secondary"
              />
              <button type="submit" disabled={!draft.trim()} className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-ink-inverse disabled:opacity-50">
                <SendIcon size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInbox;
