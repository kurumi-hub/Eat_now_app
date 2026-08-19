"use server";

import { revalidatePath } from "next/cache";

import type { ModeratorActionResult } from "@/types/moderator";
import { requirePermission } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validId(value: string) {
  return UUID_REGEX.test(value);
}

type CleanNoteResult = { error: string } | { value: string | null };

function cleanNote(value: string, required = false): CleanNoteResult {
  const note = value.trim();

  if (required && note.length < 5) {
    return { error: "Vui lòng ghi lý do rõ ràng (ít nhất 5 ký tự)." };
  }

  if (note.length > 1000) {
    return { error: "Ghi chú không được vượt quá 1.000 ký tự." };
  }

  return { value: note || null };
}

function rpcError(message: string, error?: { code?: string; message?: string }) {
  console.error("[moderator] RPC thất bại", {
    code: error?.code,
    message: error?.message,
  });

  if (error?.code === "42501") {
    return "Bạn không còn quyền thực hiện thao tác này.";
  }

  return message;
}

export async function claimReportAction(
  reportId: string
): Promise<ModeratorActionResult> {
  await requirePermission("moderation.queue");

  if (!validId(reportId)) {
    return { ok: false, message: "Mã báo cáo không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_claim_report", {
    p_report_id: reportId,
  });

  if (error) {
    return {
      ok: false,
      message: rpcError("Không thể nhận báo cáo lúc này.", error),
    };
  }

  revalidatePath("/moderator");
  return { ok: true, message: "Đã nhận báo cáo để xử lý." };
}

export async function escalateReportAction(
  reportId: string,
  note: string
): Promise<ModeratorActionResult> {
  await requirePermission("moderation.resolve");

  if (!validId(reportId)) {
    return { ok: false, message: "Mã báo cáo không hợp lệ." };
  }

  const parsedNote = cleanNote(note, true);
  if ("error" in parsedNote) {
    return { ok: false, message: parsedNote.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_escalate_report", {
    p_report_id: reportId,
    p_note: parsedNote.value,
  });

  if (error) {
    return {
      ok: false,
      message: rpcError("Không thể chuyển báo cáo cho Admin.", error),
    };
  }

  revalidatePath("/moderator");
  return { ok: true, message: "Đã chuyển báo cáo cho Admin." };
}

export async function dismissReportAction(
  reportId: string,
  note: string
): Promise<ModeratorActionResult> {
  await requirePermission("moderation.resolve");

  if (!validId(reportId)) {
    return { ok: false, message: "Mã báo cáo không hợp lệ." };
  }

  const parsedNote = cleanNote(note, true);
  if ("error" in parsedNote) {
    return { ok: false, message: parsedNote.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_resolve_report", {
    p_report_id: reportId,
    p_resolution: "dismissed",
    p_note: parsedNote.value,
  });

  if (error) {
    return {
      ok: false,
      message: rpcError("Không thể bác báo cáo lúc này.", error),
    };
  }

  revalidatePath("/moderator");
  return { ok: true, message: "Đã bác báo cáo và lưu lý do." };
}

export async function moderateReviewAction(
  reviewType: string,
  reviewId: string,
  action: "hide" | "restore",
  note: string,
  reportId: string
): Promise<ModeratorActionResult> {
  await requirePermission("moderation.review");

  if (
    !["restaurant_review", "food_review", "shipper_review"].includes(reviewType) ||
    !validId(reviewId) ||
    !validId(reportId) ||
    !["hide", "restore"].includes(action)
  ) {
    return { ok: false, message: "Dữ liệu xử lý đánh giá không hợp lệ." };
  }

  const parsedNote = cleanNote(note, true);
  if ("error" in parsedNote) {
    return { ok: false, message: parsedNote.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("api_moderate_review", {
    p_review_type: reviewType,
    p_review_id: reviewId,
    p_action: action,
    p_note: parsedNote.value,
    p_report_id: reportId,
  });

  if (error) {
    return {
      ok: false,
      message: rpcError("Không thể cập nhật trạng thái đánh giá.", error),
    };
  }

  revalidatePath("/moderator");
  return {
    ok: true,
    message:
      action === "hide"
        ? "Đã ẩn đánh giá và đóng báo cáo."
        : "Đã khôi phục đánh giá và đóng báo cáo.",
  };
}
