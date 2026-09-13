"use client";

import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { RestaurantMenuItem } from "@/components/restaurant/restaurantDetailData";
import type { ChatCatalogResult, ChatFoodResult, ChatMessage, ChatStreamEvent } from "@/lib/chat/types";
import { useCartStore } from "@/store/cartStore";
import type { FoodFlashSale } from "@/types/flashSale";

const FoodOptionsModal = dynamic(
  () => import("@/components/cart/FoodOptionsModal"),
  { ssr: false }
);

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

type CartSelection = {
  size?: { id: string; name: string; price: number };
  toppings: { id: string; name: string; price: number }[];
  note?: string;
  quantity: number;
};

type FoodOptionsPayload = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    isOpen: boolean;
    availabilityMessage: string | null;
  };
  food: RestaurantMenuItem;
  flashSale: FoodFlashSale | null;
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
  let normalized = text.replace(/\\([*_`])/g, "$1");
  const boldMarkers = normalized.match(/\*\*/g)?.length ?? 0;
  if (boldMarkers % 2 !== 0) {
    const unmatchedIndex = normalized.lastIndexOf("**");
    normalized = `${normalized.slice(0, unmatchedIndex)}${normalized.slice(unmatchedIndex + 2)}`;
  }

  return normalized.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function money(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function distanceLabel(value: number | null) {
  if (value === null) return "";
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`;
}

function FoodResultCards({
  items,
  loadingFoodId,
  onAddFood,
}: {
  items: ChatCatalogResult[];
  loadingFoodId: string | null;
  onAddFood: (item: ChatFoodResult) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="assistant-results" aria-label={`${items.length} kết quả được tìm thấy`}>
      {items.map((item) => item.kind === "food" ? (
        <article className="assistant-food-card" key={`food-${item.foodId}`}>
          <Link className="assistant-food-card__details" href={item.url}>
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
                {item.distanceKm !== null ? ` · ${distanceLabel(item.distanceKm)}` : ""}
                {item.flashSaleItemId ? " · Flash sale" : ""}
                {item.orderState !== "OPEN" ? " · Tạm ngưng nhận đơn" : ""}
              </small>
            </span>
          </Link>
          <button
            className="assistant-food-card__add"
            type="button"
            onClick={() => onAddFood(item)}
            disabled={loadingFoodId === item.foodId || item.orderState !== "OPEN"}
            aria-label={`Thêm ${item.foodName} vào giỏ`}
            title={item.orderState === "OPEN" ? "Thêm vào giỏ" : "Nhà hàng hiện chưa nhận đơn"}
          >
            <AddShoppingCartRoundedIcon fontSize="small" />
          </button>
        </article>
      ) : (
        <article className="assistant-food-card assistant-food-card--restaurant" key={`restaurant-${item.restaurantId}`}>
          <Link className="assistant-food-card__details" href={item.url}>
            <span className="assistant-food-card__image">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.imageAlt} fill unoptimized sizes="76px" />
              ) : <StorefrontRoundedIcon aria-hidden="true" />}
            </span>
            <span className="assistant-food-card__content">
              <strong>{item.restaurantName}</strong>
              <small>{item.address}</small>
              <span className="assistant-food-card__meta">
                {item.rating > 0 ? `${item.rating.toFixed(1)}★` : "Quán mới"}
                {item.distanceKm !== null ? ` · ${distanceLabel(item.distanceKm)}` : ""}
                {item.orderState === "OPEN" ? " · Đang mở" : " · Tạm ngưng"}
              </span>
              <small>
                {item.matchedFoods.length ? item.matchedFoods.slice(0, 2).join(" · ") : "Xem thực đơn"}
                {item.hasPromotion ? " · Có ưu đãi" : ""}
              </small>
            </span>
          </Link>
        </article>
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
  const [foodOptions, setFoodOptions] = useState<FoodOptionsPayload | null>(null);
  const [loadingFoodId, setLoadingFoodId] = useState<string | null>(null);
  const [pendingSelection, setPendingSelection] = useState<CartSelection | null>(null);
  const [notice, setNotice] = useState({ open: false, message: "" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const addItem = useCartStore((state) => state.addItem);
  const hasConflictingRestaurant = useCartStore((state) => state.hasConflictingRestaurant);
  const clearCart = useCartStore((state) => state.clearCart);

  const orderFood = useMemo(() => {
    if (!foodOptions) return null;
    const { food, flashSale } = foodOptions;
    if (!flashSale) return food;
    return {
      ...food,
      price: flashSale.salePrice,
      sizes: food.sizes?.map((size) => ({
        ...size,
        price: flashSale.salePrice + Math.max(0, size.price - flashSale.originalPrice),
      })),
    };
  }, [foodOptions]);

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

  const openFoodOptions = async (item: ChatFoodResult) => {
    if (loadingFoodId) return;
    setLoadingFoodId(item.foodId);
    try {
      const params = new URLSearchParams({ foodId: item.foodId, restaurant: item.restaurantSlug });
      if (item.flashSaleItemId) params.set("sale", item.flashSaleItemId);
      const response = await fetch(`/api/chat/food-options?${params}`);
      const payload = await response.json().catch(() => null) as (FoodOptionsPayload & { error?: string }) | null;
      if (!response.ok || !payload?.food || !payload.restaurant) {
        throw new Error(payload?.error || "Không tải được tùy chọn của món.");
      }
      if (!payload.restaurant.isOpen) {
        setNotice({ open: true, message: payload.restaurant.availabilityMessage || "Nhà hàng hiện chưa nhận đơn." });
        return;
      }
      if (!payload.food.isAvailable) {
        setNotice({ open: true, message: "Món này hiện chưa sẵn sàng để đặt." });
        return;
      }
      setFoodOptions(payload);
    } catch (error) {
      setNotice({
        open: true,
        message: error instanceof Error ? error.message : "Không tải được tùy chọn của món.",
      });
    } finally {
      setLoadingFoodId(null);
    }
  };

  const addFoodToCart = (selection: CartSelection) => {
    if (!foodOptions) return;
    const { restaurant, food, flashSale } = foodOptions;
    addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      foodId: food.id,
      foodName: food.name,
      foodImage: food.image,
      basePrice: flashSale?.salePrice ?? food.price,
      originalBasePrice: flashSale?.originalPrice,
      flashSaleItemId: flashSale?.id,
      flashSaleEndsAt: flashSale?.endsAt,
      flashSalePerUserLimit: flashSale?.perUserLimit,
      size: selection.size,
      toppings: selection.toppings,
      note: selection.note,
      quantity: Math.min(selection.quantity, flashSale?.perUserLimit ?? selection.quantity),
    });
    setFoodOptions(null);
    setPendingSelection(null);
    setNotice({ open: true, message: `Đã thêm ${food.name} vào giỏ hàng.` });
  };

  const confirmFoodOptions = (selection: CartSelection) => {
    if (!foodOptions) return;
    if (hasConflictingRestaurant(foodOptions.restaurant.id)) {
      setPendingSelection(selection);
      return;
    }
    addFoodToCart(selection);
  };

  const replaceCart = () => {
    if (!pendingSelection) return;
    clearCart();
    addFoodToCart(pendingSelection);
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
                      {message.results ? (
                        <FoodResultCards
                          items={message.results}
                          loadingFoodId={loadingFoodId}
                          onAddFood={(item) => void openFoodOptions(item)}
                        />
                      ) : null}
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

      <FoodOptionsModal
        open={Boolean(foodOptions)}
        food={orderFood}
        onClose={() => setFoodOptions(null)}
        onConfirm={confirmFoodOptions}
      />

      <Dialog open={Boolean(pendingSelection)} onClose={() => setPendingSelection(null)}>
        <DialogTitle>Bắt đầu giỏ hàng mới?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Giỏ hàng đang có món từ nhà hàng khác. Xóa giỏ hiện tại để thêm món từ {foodOptions?.restaurant.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingSelection(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={replaceCart}>Xóa giỏ và thêm món</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notice.open}
        autoHideDuration={2800}
        onClose={() => setNotice((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setNotice((current) => ({ ...current, open: false }))}
        >
          {notice.message}
        </Alert>
      </Snackbar>

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
