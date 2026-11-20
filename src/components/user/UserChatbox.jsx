import { useEffect, useRef, useState } from 'react';
import { GraduationCap, MessageCircle, Send, X } from 'lucide-react';

export default function UserChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);
  const canSend = Boolean(draft.trim());

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [isOpen, messages.length]);

  function closeChat() {
    setIsOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    // Chỉ hiển thị tin nhắn trong giao diện mẫu, chưa gửi đến tư vấn viên.
    setMessages((current) => [...current, { id: crypto.randomUUID(), content }]);
    setDraft('');
    inputRef.current?.focus();
  }

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 sm:right-6">
      {isOpen ? (
        <section id="user-support-chat" role="dialog" aria-modal="false" aria-labelledby="user-support-title"
          onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); closeChat(); } }}
          className="flex h-[min(480px,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-[340px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_48px_rgba(23,53,87,0.2)]">
          <header className="flex shrink-0 items-center gap-3 bg-[#173557] px-4 py-4 text-white">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#173557]"><GraduationCap size={23} /></span>
            <div className="min-w-0 flex-1">
              <h2 id="user-support-title" className="text-sm font-semibold">Hỗ trợ trực tuyến</h2>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-100"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Tư vấn khóa học</p>
            </div>
            <button type="button" onClick={closeChat} aria-label="Đóng hộp chat" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blue-100 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X size={18} /></button>
          </header>

          <div ref={conversationRef} role="log" aria-label="Nội dung trò chuyện" aria-live="polite" aria-relevant="additions"
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-5">
            <div className="flex items-end gap-2">
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#173557]"><GraduationCap size={16} /></span>
              <p className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-3 py-2.5 text-xs leading-6 text-slate-600 shadow-sm">Xin chào! 👋 Cảm ơn bạn đã quan tâm đến IIG Learning. Bạn cần tư vấn khóa học nào?</p>
            </div>
            {messages.map((message) => (
              <div key={message.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[#173557] px-3 py-2.5 text-xs leading-6 text-white [overflow-wrap:anywhere]">
                  <span className="sr-only">Bạn: </span>{message.content}
                </p>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white p-3">
            <form onSubmit={sendMessage} className="flex items-end gap-2 rounded-2xl bg-slate-100 p-1.5 pl-3">
              <label htmlFor="user-chat-message" className="sr-only">Tin nhắn tư vấn</label>
              <textarea ref={inputRef} id="user-chat-message" rows={1} maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhập tin nhắn..."
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) sendMessage(event); }}
                className="max-h-24 min-h-9 min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto rounded-lg border-0 bg-transparent py-2 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" />
              <button type="submit" disabled={!canSend} aria-label="Gửi tin nhắn" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173557] text-white transition-colors hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} /></button>
            </form>
            <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">Giao diện mẫu · Chưa kết nối tư vấn viên</p>
          </div>
        </section>
      ) : (
        <button ref={launcherRef} type="button" onClick={() => setIsOpen(true)} aria-label="Mở chat hỗ trợ khóa học" aria-expanded={isOpen} aria-haspopup="dialog"
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#173557] text-white shadow-lg transition-colors hover:bg-[#24486f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <MessageCircle size={25} />
        </button>
      )}
    </div>
  );
}
