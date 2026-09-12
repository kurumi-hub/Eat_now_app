import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { FOOTBOT_SYSTEM_PROMPT } from "@/lib/chat/prompt";
import { takeChatRateLimit } from "@/lib/chat/rateLimit";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export const runtime = "nodejs";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2_000;

type RequestMessage = {
  role?: unknown;
  content?: unknown;
};

function normalizeMessages(value: unknown) {
  if (!Array.isArray(value)) return null;

  const messages = value.slice(-MAX_MESSAGES).flatMap((message: RequestMessage) => {
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string"
    ) {
      return [];
    }

    const content = message.content.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content) return [];

    return [{
      role: message.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: content }],
    }];
  });

  if (!messages.length || messages.at(-1)?.role !== "user") return null;
  return messages;
}

function geminiErrorDetails(error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error
    && typeof error.status === "number"
    ? error.status
    : null;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const message = rawMessage
    .replace(/([?&](?:key|api_key)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/AIza[\w-]{20,}/g, "[REDACTED_API_KEY]")
    .slice(0, 400);

  return { status, message };
}

function friendlyGeminiError(error: unknown) {
  const { status, message } = geminiErrorDetails(error);
  let friendlyMessage: string;

  if (/429|quota|resource_exhausted/i.test(message)) {
    friendlyMessage = "FootBot đang nhận quá nhiều câu hỏi. Bạn vui lòng đợi một chút rồi thử lại nhé.";
  } else if (/api.?key|permission|401|403/i.test(message)) {
    friendlyMessage = "FootBot chưa được cấu hình đúng. Vui lòng liên hệ quản trị viên.";
  } else {
    friendlyMessage = "FootBot đang tạm gián đoạn. Bạn vui lòng thử lại sau nhé.";
  }

  const statusText = status ? `${status}` : "không xác định";
  const showDetailedErrors =
    process.env.NODE_ENV !== "production" ||
    process.env.CHAT_DEBUG_ERRORS?.toLowerCase() === "true";
  const safeDetail = showDetailedErrors
    ? `Gemini API ${statusText}: ${message}`
    : `Gemini API ${statusText}`;

  return `${friendlyMessage}\n\nChi tiết kỹ thuật: ${safeDetail}`;
}

function logGeminiError(error: unknown, model: string) {
  const { status, message } = geminiErrorDetails(error);
  console.error("[FootBot] Gemini request failed", {
    model,
    status,
    message,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentPublicUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập để sử dụng FootBot." },
      { status: 401 }
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identity = forwardedFor || request.headers.get("x-real-ip") || "local";
  const rateLimit = takeChatRateLimit(identity);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Bạn đang gửi câu hỏi quá nhanh. Vui lòng đợi một chút rồi thử lại." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Thiếu biến môi trường GEMINI_API_KEY." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nội dung yêu cầu không hợp lệ." }, { status: 400 });
  }

  const messages = normalizeMessages(
    typeof body === "object" && body !== null && "messages" in body
      ? body.messages
      : null
  );
  if (!messages) {
    return NextResponse.json({ error: "Không có tin nhắn hợp lệ." }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.7-flash";
  const encoder = new TextEncoder();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const geminiStream = await ai.models.generateContentStream({
      model,
      contents: messages,
      config: {
        systemInstruction: FOOTBOT_SYSTEM_PROMPT,
        temperature: 0.6,
        maxOutputTokens: 700,
      },
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let emittedText = false;
        try {
          for await (const chunk of geminiStream) {
            if (chunk.text) {
              emittedText = true;
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          if (!emittedText) {
            controller.enqueue(encoder.encode("Mình chưa thể trả lời câu hỏi này. Bạn thử diễn đạt theo cách khác nhé."));
          }
        } catch (error) {
          logGeminiError(error, model);
          controller.enqueue(encoder.encode(friendlyGeminiError(error)));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logGeminiError(error, model);
    return NextResponse.json({ error: friendlyGeminiError(error) }, { status: 502 });
  }
}
