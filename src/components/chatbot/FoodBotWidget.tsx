"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  formatTime,
  generateMessageId,
  getNextBotResponse,
  initialMessages,
  quickSuggestions,
  resetBotResponses,
  type FoodBotMessage,
} from "./foodbotData";

// ── Route filtering ────────────────────────────────────────────────────
const HIDDEN_ROUTE_PREFIXES = ["/owner", "/shipper", "/admin", "/moderator"];

function shouldHideWidget(pathname: string): boolean {
  return HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// ── Markdown-lite bold renderer ────────────────────────────────────────
function renderBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ── Main Widget ────────────────────────────────────────────────────────
export default function FoodBotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<FoodBotMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendUserMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: FoodBotMessage = {
        id: generateMessageId("user"),
        type: "user",
        text: text.trim(),
        time: formatTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);

      // Simulate bot typing delay
      setTimeout(() => {
        const response = getNextBotResponse();
        const botMsg: FoodBotMessage = {
          id: generateMessageId("bot"),
          type: "bot",
          text: response.text,
          time: formatTime(),
          recommendation: response.recommendation,
          searchNote: response.searchNote,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 800 + Math.random() * 700);
    },
    []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendUserMessage(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendUserMessage(inputValue);
    }
  };

  const handleRestart = () => {
    resetBotResponses();
    setMessages(initialMessages);
    setIsTyping(false);
    setInputValue("");
  };

  // Don't render on owner/shipper/admin routes
  if (shouldHideWidget(pathname)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 max-[760px]:bottom-[92px] max-[760px]:right-4">
      {/* ── Chat Window ─────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[380px] sm:w-[410px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-[0_24px_64px_rgba(37,29,24,0.16)] border border-[#ddc1b4] flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-[#fff8f4] px-4 py-3 border-b border-[#ddc1b4] flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Bot Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d94720]/30 shadow-sm bg-[#f5e5dd] flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[#7a3000] text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              {/* Title */}
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-[family-name:var(--font-be-vietnam)] text-base font-semibold text-[#221a15]">
                    Trợ lý FoodBot AI
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#d94720]/10 text-[#d94720]">
                    PRO
                  </span>
                </div>
                <p className="font-[family-name:var(--font-be-vietnam)] text-[11px] text-[#5a4136] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Gợi ý món ngon &amp; giải đáp 24/7
                </p>
              </div>
            </div>
            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 text-[#5a4136] hover:text-[#d94720] hover:bg-[#f5e5dd] rounded-full transition-colors"
                onClick={handleRestart}
                title="Bắt đầu lại cuộc trò chuyện"
                aria-label="Bắt đầu lại cuộc trò chuyện"
              >
                <span className="material-symbols-outlined text-[20px]">restart_alt</span>
              </button>
              <button
                type="button"
                className="p-1.5 text-[#5a4136] hover:text-[#d94720] hover:bg-[#f5e5dd] rounded-full transition-colors"
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
                aria-label="Đóng chat"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fff8f4]/50">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === "bot" ? (
                  /* Bot Message */
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ddc1b4] flex-shrink-0 bg-[#f5e5dd] flex items-center justify-center mt-0.5">
                      <span
                        className="material-symbols-outlined text-[#7a3000] text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        smart_toy
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-white border border-[#ddc1b4] p-3 rounded-2xl rounded-tl-sm text-sm text-[#221a15] shadow-sm">
                        <p className="font-[family-name:var(--font-be-vietnam)] leading-relaxed">
                          {renderBoldText(msg.text)}
                        </p>
                      </div>

                      {/* Restaurant Recommendation Card */}
                      {msg.recommendation && (
                        <div className="bg-white border border-[#ddc1b4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex p-2.5 gap-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#f5e5dd]">
                              <Image
                                src={msg.recommendation.imageUrl}
                                alt={msg.recommendation.dishName}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-[family-name:var(--font-be-vietnam)] text-sm font-semibold text-[#221a15] leading-snug">
                                    {msg.recommendation.dishName}
                                  </h4>
                                  <span className="text-[11px] text-[#5a4136]">
                                    {msg.recommendation.restaurant} •{" "}
                                    {msg.recommendation.distance}
                                  </span>
                                </div>
                                <span className="text-[#d94720] font-bold text-sm">
                                  {msg.recommendation.price}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[#ddc1b4]/60">
                                <div className="flex items-center gap-1.5 text-[11px] text-[#5a4136]">
                                  <span className="flex items-center text-amber-600 font-semibold">
                                    <span className="material-symbols-outlined text-[14px]">
                                      star
                                    </span>
                                    {msg.recommendation.rating}
                                  </span>
                                  <span>•</span>
                                  <span>{msg.recommendation.deliveryTime}</span>
                                </div>
                                <Link
                                  href="/restaurants"
                                  className="bg-[#d94720] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-[#b93618] transition-colors flex items-center gap-0.5 shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-[13px]">
                                    add
                                  </span>
                                  Thêm món
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Search Note */}
                      {msg.searchNote && (
                        <div className="flex items-center gap-1 text-[11px] text-[#5a4136] ml-1">
                          <span className="material-symbols-outlined text-[14px] text-[#d94720] animate-pulse">
                            auto_awesome
                          </span>
                          <span>{msg.searchNote}</span>
                        </div>
                      )}

                      <span className="text-[10px] text-[#5a4136]/70 mt-1 ml-1 inline-block">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* User Message */
                  <div className="flex items-start justify-end gap-2">
                    <div className="flex flex-col items-end max-w-[80%]">
                      <div className="bg-[#d94720] text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-sm">
                        <p className="font-[family-name:var(--font-be-vietnam)] leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#5a4136]/70 mt-1 mr-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Suggestions */}
                {msg.showSuggestions && (
                  <div className="pl-10 mt-3">
                    <p className="text-[11px] font-medium text-[#5a4136] mb-2">
                      Gợi ý nhanh:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          type="button"
                          className="bg-white hover:bg-[#f5e5dd] hover:text-[#d94720] border border-[#ddc1b4] text-[#221a15] text-xs px-2.5 py-1.5 rounded-full transition-all shadow-sm"
                          onClick={() =>
                            sendUserMessage(
                              `${suggestion.emoji} ${suggestion.label}`
                            )
                          }
                        >
                          {suggestion.emoji} {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bot Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ddc1b4] flex-shrink-0 bg-[#f5e5dd] flex items-center justify-center mt-0.5">
                  <span
                    className="material-symbols-outlined text-[#7a3000] text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <div className="bg-white border border-[#ddc1b4] px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#8e7069] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-[#8e7069] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-[#8e7069] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#ddc1b4] flex-shrink-0">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-1.5 bg-[#f5f1ee] rounded-full px-3 py-1.5 border border-[#ddc1b4] focus-within:border-[#d94720] focus-within:ring-1 focus-within:ring-[#d94720] transition-all">
                <button
                  type="button"
                  className="text-[#5a4136] hover:text-[#d94720] transition-colors p-1 rounded-full"
                  title="Đính kèm ảnh"
                  aria-label="Đính kèm ảnh"
                >
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </button>
                <button
                  type="button"
                  className="text-[#5a4136] hover:text-[#d94720] transition-colors p-1 rounded-full"
                  title="Tìm bằng giọng nói"
                  aria-label="Tìm bằng giọng nói"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none font-[family-name:var(--font-be-vietnam)] text-sm text-[#221a15] px-1 py-1 focus:ring-0 placeholder:text-[#5a4136]/60"
                  placeholder="Hỏi FoodBot bất cứ điều gì..."
                />
                <button
                  type="submit"
                  className="bg-[#d94720] hover:bg-[#b93618] text-white w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0 disabled:opacity-50"
                  disabled={!inputValue.trim()}
                  aria-label="Gửi tin nhắn"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </form>
            <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-[#5a4136]/70">
              <span>Được hỗ trợ bởi EatNow AI Food Assistant</span>
              <span>Nhấn Enter để gửi</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ──────────────────────────────── */}
      <button
        type="button"
        className={`group w-14 h-14 rounded-full shadow-[0_14px_26px_rgba(119,87,77,0.28)] flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? "bg-[#5a4136] hover:bg-[#3e2c24] scale-90"
            : "bg-[#7a3000] hover:bg-[#a04100] hover:-translate-y-0.5 hover:scale-[1.03]"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Đóng trợ lý FoodBot" : "Mở trợ lý FoodBot"}
      >
        <span className="material-symbols-outlined text-white text-2xl">
          {isOpen ? "close" : "chat"}
        </span>
        {/* Tooltip label (only when closed) */}
        {!isOpen && (
          <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#2f3133] px-2.5 py-1.5 text-xs font-semibold text-[#f0f0f3] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Trợ lý FoodBot
          </span>
        )}
      </button>
    </div>
  );
}
