"use client";

// ── Types ──────────────────────────────────────────────────────────────

export interface RestaurantRecommendation {
  name: string;
  dishName: string;
  restaurant: string;
  distance: string;
  price: string;
  rating: number;
  ratingCount: string;
  deliveryTime: string;
  imageUrl: string;
}

export type MessageType = "bot" | "user";

export interface FoodBotMessage {
  id: string;
  type: MessageType;
  text: string;
  time: string;
  /** Inline restaurant recommendation card */
  recommendation?: RestaurantRecommendation;
  /** Show quick suggestions after this message */
  showSuggestions?: boolean;
  /** AI search footer note */
  searchNote?: string;
}

export interface QuickSuggestion {
  emoji: string;
  label: string;
}

// ── Quick Suggestion Chips ─────────────────────────────────────────────

export const quickSuggestions: QuickSuggestion[] = [
  { emoji: "💡", label: "Hôm nay ăn gì?" },
  { emoji: "💰", label: "Món ngon dưới 50k" },
  { emoji: "⚡", label: "Giao nhanh < 20p" },
  { emoji: "🥗", label: "Đồ ăn eat-clean" },
];

// ── Initial Conversation (matches design screenshot) ───────────────────

export const initialMessages: FoodBotMessage[] = [
  {
    id: "bot-welcome",
    type: "bot",
    text: "Xin chào! Mình là **FoodBot** 🍜. Hôm nay bạn muốn tìm món gì, ăn tại quán hay giao tận nơi nè?",
    time: "11:42",
    showSuggestions: true,
  },
];

// ── Mock Bot Responses ─────────────────────────────────────────────────

const mockRecommendation: RestaurantRecommendation = {
  name: "Cơm Tấm Sườn Bì Chả",
  dishName: "Cơm Tấm Sườn Bì Chả",
  restaurant: "Cơm Tấm Sáu Hiếu",
  distance: "1.2km",
  price: "42.000đ",
  rating: 4.8,
  ratingCount: "100+",
  deliveryTime: "15-20p",
  imageUrl: "/images/home/food-com-tam.png",
};

const mockBotResponses: Array<{
  text: string;
  recommendation?: RestaurantRecommendation;
  searchNote?: string;
}> = [
  {
    text: "Dạ có ngay! Quanh khu vực Ninh Kiều đang có quán **Cơm Tấm Sáu Hiếu** đang được freeship và rất hợp khẩu vị bạn nè:",
    recommendation: mockRecommendation,
    searchNote: "FoodBot vừa tìm kiếm từ 12 quán mở cửa gần bạn",
  },
  {
    text: "Mình gợi ý bạn thử **Phở 2000 - Ninh Kiều** nhé! Phở bò tái nạm 45.000đ, rating 4.5 ⭐ và chỉ cách bạn 800m thôi.",
  },
  {
    text: "Nếu bạn muốn ăn nhẹ, **Tiệm Bánh Mì Góc Phố** có bánh mì thịt nướng chỉ 25.000đ, giao trong 10-15 phút luôn nè! 🥖",
  },
  {
    text: "Bạn muốn mình tìm thêm quán nào khác không? Mình có thể lọc theo loại món, khoảng giá, hoặc thời gian giao hàng nhé! 😊",
  },
  {
    text: "Dạ, để mình tìm giúp bạn các quán eat-clean gần đây nha. Quán **Green Salad Cần Thơ** có combo salad + nước ép chỉ 55.000đ, rất nhiều người đánh giá cao! 🥗",
  },
];

let responseIndex = 0;

export function getNextBotResponse(): {
  text: string;
  recommendation?: RestaurantRecommendation;
  searchNote?: string;
} {
  const response = mockBotResponses[responseIndex % mockBotResponses.length];
  responseIndex++;
  return response;
}

export function resetBotResponses(): void {
  responseIndex = 0;
}

// ── Helpers ────────────────────────────────────────────────────────────

export function formatTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

let messageCounter = 0;

export function generateMessageId(prefix: string): string {
  messageCounter++;
  return `${prefix}-${Date.now()}-${messageCounter}`;
}
