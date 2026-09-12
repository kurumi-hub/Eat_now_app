"use client";

import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import Image from "next/image";
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

import type { ChatFoodResult, ChatMessage, ChatStreamEvent } from "@/lib/chat/types";

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

function money(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function FoodResultCards({ items }: { items: ChatFoodResult[] }) {
  if (!items.length) return null;
  return (
    <div className="assistant-results" aria-label={`${items.length} món ăn được tìm thấy`}>
      {items.map((item) => (
        <Link className="assistant-food-card" href={item.url} key={item.foodId}>
          <span className="assistant-food-card__image">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.imageAlt} fill unoptimized sizes="76px" />
            ) : <SmartToyRoundedIcon aria-hidden="true" />}
          </span>
          <span className="assistant-food-card__content">
            <strong>{item.foodName}</strong>
            <small>{item.restaurantName}</small>
            <span>
              <b>{item.hasSizes ? `Từ ${money(item.price)}` : money(item.price)}</b>
              {item.normalPrice !== item.price ? <del>{money(item.normalPrice)}</del> : null}
            </span>
            <small>
              {item.foodRating > 0 ? `${item.foodRating.toFixed(1)}★` : "Món mới"}
              {item.distanceKm !== null ? ` · ${item.distanceKm.toLocaleString("vi-VN")} km` : ""}
              {item.flashSaleItemId ? " · Flash sale" : ""}
            </small>
          </span>
          <span className="assistant-food-card__action">Xem món</span>
        </Link>
      ))}
    </div>
  );
}

export default function ChatWidget({ isAuthenticated }: ChatWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [greetingMessage("")]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    if (isAuthenticated && !isSending) inputRef.current?.focus();
  }, [isAuthenticated, isOpen, isSending, messages]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const resetConversation = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    sendingRef.current = false;
    setIsSending(false);
    setMessages([greetingMessage()]);
    setInput("");
  };

  const sendMessage = async (rawContent: string, contextMessages = messages) => {
    const content = rawContent.trim();
    if (!isAuthenticated || !content || sendingRef.current) return;

    const userMessage = newMessage("user", content);
    const assistantMessage = newMessage("assistant", "");
    const requestMessages = [...contextMessages, userMessage].slice(-MAX_CONTEXT_MESSAGES);
    const controller = new AbortController();
    requestRef.current = controller;
    sendingRef.current = true;

    setInput("");
    setIsSending(true);
    setMessages([...contextMessages, userMessage, assistantMessage]);

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
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || "Không thể kết nối với FootBot.");
      }

      if (!response.body) throw new Error("Phản hồi từ FootBot không hợp lệ.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamError: Extract<ChatStreamEvent, { type: "error" }> | null = null;

      const consumeLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as ChatStreamEvent;
        if (event.type === "text") {
          setMessages((current) => current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: message.content + event.text }
              : message
          ));
        } else if (event.type === "results") {
          setMessages((current) => current.map((message) =>
            message.id === assistantMessage.id ? { ...message, results: event.items } : message
          ));
        } else if (event.type === "error") {
          streamError = event;
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(consumeLine);
      }
      buffer += decoder.decode();
      if (buffer.trim()) consumeLine(buffer);
      if (streamError) {
        const message = streamError as Extract<ChatStreamEvent, { type: "error" }>;
        setMessages((current) => current.map((item) => item.id === assistantMessage.id
          ? {
              ...item,
              content: item.content ? `${item.content}\n\n${message.message}` : message.message,
              failed: message.retryable,
            }
          : item));
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      const receivedMessage = error instanceof Error ? error.message : "";
      const errorMessage = /^(FootBot|Vui lòng|Bạn đang|Không thể|Phản hồi)/.test(receivedMessage)
        ? receivedMessage
        : "FootBot đang tạm gián đoạn. Bạn vui lòng thử lại nhé.";
      setMessages((current) => current.map((message) =>
        message.id === assistantMessage.id
          ? { ...message, content: errorMessage, failed: true }
          : message
      ));
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        sendingRef.current = false;
        setIsSending(false);
      }
    }
  };

  const stopSending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    sendingRef.current = false;
    setIsSending(false);
    setMessages((current) => current.map((message, index) =>
      index === current.length - 1 && message.role === "assistant" && !message.content
        ? { ...message, content: "Đã dừng trả lời." }
        : message
    ));
  };

  const retryMessage = (assistantId: string) => {
    const assistantIndex = messages.findIndex((message) => message.id === assistantId);
    const userMessage = assistantIndex > 0 ? messages[assistantIndex - 1] : null;
    if (!userMessage || userMessage.role !== "user") return;
    const baseMessages = messages.slice(0, assistantIndex - 1);
    void sendMessage(userMessage.content, baseMessages);
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
                      {message.results ? <FoodResultCards items={message.results} /> : null}
                      {message.failed ? (
                        <button className="assistant-retry" type="button" onClick={() => retryMessage(message.id)}>
                          Thử lại
                        </button>
                      ) : null}
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
                <button
                  type={isSending ? "button" : "submit"}
                  onClick={isSending ? stopSending : undefined}
                  disabled={!isSending && !input.trim()}
                  aria-label={isSending ? "Dừng trả lời" : "Gửi tin nhắn"}
                >
                  {isSending ? <StopCircleRoundedIcon fontSize="small" /> : <SendRoundedIcon fontSize="small" />}
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
