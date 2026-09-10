"use client";

import { Bot, MessageCircle, Plus, Send, Sparkles, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/lib/chat/types";

const STORAGE_KEY = "eatnow-assistant-session-v1";
const MAX_CONTEXT_MESSAGES = 12;

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: "Xin chào! Mình là EatNow Assistant. Hôm nay bạn muốn ăn gì?",
};

const QUICK_QUESTIONS = [
  "Gợi ý món cho hôm nay",
  "Ăn gì dưới 100.000đ?",
  "Tôi muốn tìm món chay",
  "Hướng dẫn sử dụng voucher",
];

function newMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${role}-${Date.now()}-${Math.random()}`,
    role,
    content,
  };
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let restoredMessages = [GREETING];
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) restoredMessages = parsed;
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    const restoreTimer = window.setTimeout(() => {
      setMessages(restoredMessages);
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [isHydrated, messages]);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    if (!isSending) inputRef.current?.focus();
  }, [isOpen, isSending, messages]);

  const resetConversation = () => {
    setMessages([GREETING]);
    setInput("");
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || isSending) return;

    const userMessage = newMessage("user", content);
    const assistantMessage = newMessage("assistant", "");
    const requestMessages = [...messages, userMessage].slice(-MAX_CONTEXT_MESSAGES);

    setInput("");
    setIsSending(true);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || "Không thể kết nối với EatNow Assistant.");
      }

      if (!response.body) throw new Error("Phản hồi từ trợ lý không hợp lệ.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value, { stream: true });
        setMessages((current) => current.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: message.content + textChunk }
            : message
        ));
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "EatNow Assistant đang tạm gián đoạn. Bạn vui lòng thử lại nhé.";
      setMessages((current) => current.map((message) =>
        message.id === assistantMessage.id ? { ...message, content: errorMessage } : message
      ));
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="eatnow-assistant">
      {isOpen ? (
        <section className="assistant-panel" aria-label="EatNow Assistant">
          <header className="assistant-header">
            <div className="assistant-brand">
              <span className="assistant-avatar" aria-hidden="true"><Bot size={22} /></span>
              <div>
                <strong>EatNow Assistant</strong>
                <span><i /> Trợ lý chọn món</span>
              </div>
            </div>
            <div className="assistant-header-actions">
              <button
                type="button"
                onClick={resetConversation}
                aria-label="Tạo cuộc trò chuyện mới"
                title="Cuộc trò chuyện mới"
              >
                <Plus size={20} />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng trợ lý">
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="assistant-messages" ref={scrollRef} aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`assistant-message ${message.role}`}>
                {message.role === "assistant" ? (
                  <span className="assistant-message-icon" aria-hidden="true"><Sparkles size={15} /></span>
                ) : null}
                <div className={message.content ? "assistant-bubble" : "assistant-bubble is-typing"}>
                  {message.content || <><span /><span /><span /></>}
                </div>
              </div>
            ))}

            {messages.length === 1 ? (
              <div className="assistant-quick-questions" aria-label="Câu hỏi nhanh">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    type="button"
                    key={question}
                    onClick={() => void sendMessage(question)}
                    disabled={isSending}
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form className="assistant-composer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 2_000))}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi EatNow Assistant..."
              rows={1}
              disabled={isSending}
              aria-label="Tin nhắn"
            />
            <button type="submit" disabled={!input.trim() || isSending} aria-label="Gửi tin nhắn">
              <Send size={19} />
            </button>
          </form>
          <p className="assistant-disclaimer">AI có thể trả lời chưa chính xác. Không chia sẻ mật khẩu hoặc OTP.</p>
        </section>
      ) : null}

      <button
        type="button"
        className={`assistant-launcher${isOpen ? " is-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Đóng EatNow Assistant" : "Mở EatNow Assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={25} /> : <MessageCircle size={27} />}
        {!isOpen ? <span>Hỏi EatNow</span> : null}
      </button>
    </div>
  );
}
