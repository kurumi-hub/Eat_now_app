"use client";

import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ChatMessage } from "@/lib/chat/types";

const MAX_CONTEXT_MESSAGES = 12;

const QUICK_QUESTIONS = [
  "Gợi ý món cho hôm nay",
  "Ăn gì dưới 100.000đ?",
  "Tôi muốn tìm món chay",
  "Hướng dẫn sử dụng voucher",
];

type ChatWidgetProps = {
  isAuthenticated: boolean;
};

function formatTime() {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function greetingMessage(time = formatTime()): ChatMessage {
  return {
    id: "greeting",
    role: "assistant",
    content: "Xin chào! Mình là **FootBot** 🍜. Hôm nay bạn muốn ăn gì?",
    time,
  };
}

function newMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${role}-${Date.now()}-${Math.random()}`,
    role,
    content,
    time: formatTime(),
  };
}

function renderMessageText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

export default function ChatWidget({ isAuthenticated }: ChatWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [greetingMessage("")]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    if (isAuthenticated && !isSending) inputRef.current?.focus();
  }, [isAuthenticated, isOpen, isSending, messages]);

  const resetConversation = () => {
    setMessages([greetingMessage()]);
    setInput("");
  };

  const sendMessage = async (rawContent: string) => {
    const content = rawContent.trim();
    if (!isAuthenticated || !content || isSending) return;

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
        throw new Error(payload?.error || "Không thể kết nối với FootBot.");
      }

      if (!response.body) throw new Error("Phản hồi từ FootBot không hợp lệ.");

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
        : "FootBot đang tạm gián đoạn. Bạn vui lòng thử lại nhé.";
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

  const loginHref = `/login?next=${encodeURIComponent(pathname || "/")}`;

  return (
    <div className="eatnow-assistant">
      {isOpen ? (
        <section className="assistant-panel" aria-label="FootBot">
          <header className="assistant-header">
            <div className="assistant-brand">
              <span className="assistant-avatar" aria-hidden="true">
                <SmartToyRoundedIcon fontSize="small" />
                <i />
              </span>
              <div>
                <strong>Trợ lý FootBot AI</strong>
                <span><i /> Gợi ý món ngon và giải đáp</span>
              </div>
            </div>
            <div className="assistant-header-actions">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={resetConversation}
                  aria-label="Bắt đầu lại cuộc trò chuyện"
                  title="Bắt đầu lại cuộc trò chuyện"
                >
                  <RestartAltRoundedIcon fontSize="small" />
                </button>
              ) : null}
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng FootBot">
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          </header>

          {isAuthenticated ? (
            <>
              <div className="assistant-messages" ref={scrollRef} aria-live="polite">
                {messages.map((message) => (
                  <div key={message.id} className={`assistant-message ${message.role}`}>
                    {message.role === "assistant" ? (
                      <span className="assistant-message-icon" aria-hidden="true">
                        <SmartToyRoundedIcon />
                      </span>
                    ) : null}
                    <div className="assistant-message-content">
                      <div className={message.content ? "assistant-bubble" : "assistant-bubble is-typing"}>
                        {message.content
                          ? renderMessageText(message.content)
                          : <><span /><span /><span /></>}
                      </div>
                      {message.content && message.time ? <time>{message.time}</time> : null}
                    </div>
                  </div>
                ))}

                {messages.length === 1 ? (
                  <div className="assistant-quick-questions" aria-label="Câu hỏi nhanh">
                    <p>Gợi ý nhanh:</p>
                    <div>
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
                  </div>
                ) : null}
              </div>

              <form className="assistant-composer" onSubmit={handleSubmit}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 2_000))}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi FootBot bất cứ điều gì..."
                  rows={1}
                  disabled={isSending}
                  aria-label="Tin nhắn"
                />
                <button type="submit" disabled={!input.trim() || isSending} aria-label="Gửi tin nhắn">
                  <SendRoundedIcon fontSize="small" />
                </button>
              </form>
              <p className="assistant-disclaimer">AI có thể trả lời chưa chính xác. Không chia sẻ mật khẩu hoặc OTP.</p>
            </>
          ) : (
            <div className="assistant-guest">
              <span className="assistant-message-icon" aria-hidden="true">
                <SmartToyRoundedIcon />
              </span>
              <div>
                <div className="assistant-bubble">
                  Xin chào! Mình là <strong>FootBot</strong> 🍜. Đăng nhập để mình giúp bạn chọn món và sử dụng EatNow nhé.
                </div>
                <Link href={loginHref}>Đăng nhập để trò chuyện</Link>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <button
        type="button"
        className={`assistant-launcher${isOpen ? " is-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Đóng FootBot" : "Mở FootBot"}
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseRoundedIcon /> : <ChatRoundedIcon />}
        {!isOpen ? <span>Trợ lý FootBot</span> : null}
      </button>
    </div>
  );
}
