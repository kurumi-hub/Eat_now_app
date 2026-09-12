import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  type Content,
  type FunctionCall,
} from "@google/genai";
import { NextResponse } from "next/server";

import { FOOTBOT_SYSTEM_PROMPT } from "@/lib/chat/prompt";
import { takeChatRateLimit } from "@/lib/chat/rateLimit";
import { normalizeFoodSearchArgs, searchChatFoods } from "@/lib/chat/search";
import type { ChatStreamEvent } from "@/lib/chat/types";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { getDeliverySelection } from "@/lib/deliverySelection";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { hasRole } from "@/utils/roles";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_TOTAL_MESSAGE_LENGTH = 12_000;
const MAX_BODY_LENGTH = 50_000;
const REQUEST_TIMEOUT_MS = 30_000;

type RequestMessage = { role?: unknown; content?: unknown };
type GeminiContent = { role: "user" | "model"; parts: Array<{ text: string }> };

const foodSearchTool = {
  name: "search_foods",
  description: "Tìm món ăn thật đang có trên EatNow theo từ khóa, chế độ ăn, ngân sách, vị trí và khuyến mãi.",
  parametersJsonSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      query: { type: "string", description: "Chỉ tên món, loại món, category hoặc tên nhà hàng cần tìm; bỏ các từ chung như món, giá, gần tôi và bỏ chế độ ăn đã đưa vào tags." },
      tags: { type: "array", items: { type: "string" }, maxItems: 4, description: "Tag chế độ ăn bắt buộc, ví dụ Ăn chay, Thuần chay hoặc Halal." },
      minPrice: { type: "number", minimum: 0, description: "Giá tối thiểu VND cho một món." },
      maxPrice: { type: "number", minimum: 0, description: "Ngân sách tối đa VND cho một món." },
      openOnly: { type: "boolean", description: "Chỉ lấy nhà hàng đang nhận đơn; mặc định true." },
      promotionOnly: { type: "boolean", description: "Chỉ lấy món có flash sale đang hiệu lực." },
      maxDistanceKm: { type: "number", minimum: 0.5, maximum: 30, description: "Bán kính tối đa nếu người dùng yêu cầu gần họ." },
      sort: { type: "string", enum: ["recommended", "nearest", "rating", "price"] },
      limit: { type: "integer", minimum: 1, maximum: 5 },
    },
  },
};

function normalizeMessages(value: unknown): GeminiContent[] | null {
  if (!Array.isArray(value)) return null;
  const messages = value.slice(-MAX_MESSAGES).flatMap((message: RequestMessage) => {
    if (!message || (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string") return [];
    const content = message.content.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content) return [];
    return [{
      role: message.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: content }],
    }];
  });

  while (messages[0]?.role === "model") messages.shift();
  const totalLength = messages.reduce((sum, message) => sum + message.parts[0].text.length, 0);
  if (!messages.length || messages.at(-1)?.role !== "user" ||
      totalLength > MAX_TOTAL_MESSAGE_LENGTH) return null;
  return messages;
}

function geminiErrorDetails(error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error &&
    typeof error.status === "number" ? error.status : null;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const message = rawMessage
    .replace(/([?&](?:key|api_key)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/AIza[\w-]{20,}/g, "[REDACTED_API_KEY]")
    .slice(0, 400);
  return { status, message };
}

function friendlyError(error: unknown) {
  const { message } = geminiErrorDetails(error);
  if (/abort|timeout|timed out/i.test(message)) {
    return { code: "UPSTREAM_TIMEOUT", message: "FootBot phản hồi hơi lâu. Bạn thử lại giúp mình nhé.", retryable: true } as const;
  }
  if (/429|quota|resource_exhausted/i.test(message)) {
    return { code: "UPSTREAM_BUSY", message: "FootBot đang nhận quá nhiều câu hỏi. Bạn đợi một chút rồi thử lại nhé.", retryable: true } as const;
  }
  if (/FOOD_SEARCH_FAILED/i.test(message)) {
    return { code: "SEARCH_UNAVAILABLE", message: "Mình chưa tải được danh sách món. Bạn thử lại sau nhé.", retryable: true } as const;
  }
  if (/api.?key|permission|401|403/i.test(message)) {
    return { code: "CONFIGURATION_ERROR", message: "FootBot đang được bảo trì. Vui lòng thử lại sau.", retryable: false } as const;
  }
  return { code: "UPSTREAM_ERROR", message: "FootBot đang tạm gián đoạn. Bạn vui lòng thử lại nhé.", retryable: true } as const;
}

function logError(error: unknown, model: string, requestId: string) {
  const { status, message } = geminiErrorDetails(error);
  console.error("[FootBot] request failed", { requestId, model, status, message });
}

function eventLine(event: ChatStreamEvent) {
  return `${JSON.stringify(event)}\n`;
}

async function takePersistentRateLimit(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_take_chat_rate_limit", {
    p_minute_limit: 10,
    p_hour_limit: 100,
  });
  if (!error && data && typeof data === "object") {
    const result = data as { allowed?: unknown; retry_after_seconds?: unknown };
    return {
      allowed: result.allowed === true,
      retryAfterSeconds: Math.max(0, Number(result.retry_after_seconds) || 0),
    };
  }

  console.warn("[FootBot] persistent rate limit unavailable", { code: error?.code });
  return takeChatRateLimit(userId);
}

function functionResponseContent(call: FunctionCall, output: Record<string, unknown>): Content {
  return {
    role: "user",
    parts: [{
      functionResponse: {
        id: call.id,
        name: "search_foods",
        response: { output },
      },
    }],
  };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const user = await getCurrentPublicUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để sử dụng FootBot." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();
  if (!apiKey || !model) {
    console.error("[FootBot] missing server configuration", {
      requestId,
      hasApiKey: Boolean(apiKey),
      hasModel: Boolean(model),
    });
    return NextResponse.json({ error: "FootBot đang được bảo trì. Vui lòng thử lại sau." }, { status: 503 });
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "Nội dung yêu cầu quá lớn." }, { status: 413 });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: "Nội dung yêu cầu quá lớn." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Nội dung yêu cầu không hợp lệ." }, { status: 400 });
  }
  const messages = normalizeMessages(
    typeof body === "object" && body !== null && "messages" in body ? body.messages : null
  );
  if (!messages) {
    return NextResponse.json({ error: "Không có tin nhắn hợp lệ hoặc hội thoại quá dài." }, { status: 400 });
  }

  const rateLimit = await takePersistentRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Bạn đang gửi câu hỏi quá nhanh. Vui lòng đợi một chút rồi thử lại." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
  const encoder = new TextEncoder();

  try {
    const addresses = hasRole(user, "CUSTOMER") ? await getCurrentUserAddresses() : [];
    const deliverySelection = await getDeliverySelection(addresses);
    const location = typeof deliverySelection?.lat === "number" &&
      typeof deliverySelection?.lon === "number"
      ? { lat: deliverySelection.lat, lon: deliverySelection.lon }
      : null;
    const ai = new GoogleGenAI({ apiKey });
    const firstResponse = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction: FOOTBOT_SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 500,
        abortSignal: signal,
        tools: [{ functionDeclarations: [foodSearchTool] }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
      },
    });

    const call = firstResponse.functionCalls?.find((item) => item.name === "search_foods");
    let foodResults = null as Awaited<ReturnType<typeof searchChatFoods>> | null;
    let finalStream: Awaited<ReturnType<typeof ai.models.generateContentStream>> | null = null;
    let directText = firstResponse.text?.trim() || "";

    if (call) {
      foodResults = await searchChatFoods(normalizeFoodSearchArgs(call.args), location);
      const modelContent = firstResponse.candidates?.[0]?.content;
      if (!modelContent) throw new Error("Gemini tool call did not include model content");
      finalStream = await ai.models.generateContentStream({
        model,
        contents: [
          ...messages,
          modelContent,
          functionResponseContent(call, {
            items: foodResults.items,
            count: foodResults.items.length,
            locationAvailable: foodResults.locationAvailable,
          }),
        ],
        config: {
          systemInstruction: FOOTBOT_SYSTEM_PROMPT,
          temperature: 0.3,
          maxOutputTokens: 500,
          abortSignal: signal,
          tools: [{ functionDeclarations: [foodSearchTool] }],
          toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.NONE } },
        },
      });
      directText = "";
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: ChatStreamEvent) => controller.enqueue(encoder.encode(eventLine(event)));
        let emittedText = false;
        try {
          emit({ type: "start", requestId });
          if (foodResults) emit({ type: "results", items: foodResults.items });
          if (directText) {
            emittedText = true;
            emit({ type: "text", text: directText });
          } else if (finalStream) {
            for await (const chunk of finalStream) {
              if (chunk.text) {
                emittedText = true;
                emit({ type: "text", text: chunk.text });
              }
            }
          }
          if (!emittedText) {
            emit({ type: "text", text: "Mình chưa thể trả lời câu hỏi này. Bạn thử diễn đạt theo cách khác nhé." });
          }
          emit({ type: "done" });
        } catch (error) {
          logError(error, model, requestId);
          emit({ type: "error", ...friendlyError(error) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    logError(error, model, requestId);
    return NextResponse.json({ error: friendlyError(error).message }, {
      status: 502,
      headers: { "X-Request-Id": requestId },
    });
  }
}
