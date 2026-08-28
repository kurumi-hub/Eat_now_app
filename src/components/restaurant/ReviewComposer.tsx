"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Alert, Button, MenuItem, Rating, TextField } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitCatalogReviewAction } from "@/app/restaurants/review-actions";
import type { ReviewEligibleOrder } from "./reviewData";

type ReviewComposerProps = {
  targetType: "restaurant" | "food";
  targetId: string;
  targetName: string;
  restaurantSlug: string;
  isAuthenticated: boolean;
  eligibleOrders: ReviewEligibleOrder[];
};

function orderLabel(order: ReviewEligibleOrder) {
  const date = new Date(order.completedAt);
  const completed = Number.isNaN(date.getTime()) ? "đã hoàn thành" : date.toLocaleDateString("vi-VN");
  return `Đơn #${order.code} · ${completed}${order.existingRating ? " · đã bình luận" : ""}`;
}

export default function ReviewComposer({
  targetType,
  targetId,
  targetName,
  restaurantSlug,
  isAuthenticated,
  eligibleOrders,
}: ReviewComposerProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(eligibleOrders[0]?.orderId || "");
  const [rating, setRating] = useState(eligibleOrders[0]?.existingRating || 5);
  const [comment, setComment] = useState(eligibleOrders[0]?.existingComment || "");
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const selectOrder = (nextOrderId: string) => {
    const selected = eligibleOrders.find((order) => order.orderId === nextOrderId);
    setOrderId(nextOrderId);
    setRating(selected?.existingRating || 5);
    setComment(selected?.existingComment || "");
    setNotice(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="restaurant-review-composer is-locked">
        <div><EditOutlinedIcon /><div><strong>Viết bình luận</strong><span>Đăng nhập để chia sẻ trải nghiệm từ đơn đã hoàn thành.</span></div></div>
        <Button
          component={Link}
          href={`/login?next=${encodeURIComponent(`/restaurants/${restaurantSlug}${targetType === "food" ? `/foods/${targetId}` : ""}`)}`}
          variant="outlined"
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  if (!eligibleOrders.length) {
    return (
      <Alert severity="info" className="restaurant-review-eligibility">
        Bạn có thể bình luận {targetType === "food" ? "món ăn" : "nhà hàng"} sau khi hoàn thành đơn có {targetName}, trong vòng 30 ngày.
      </Alert>
    );
  }

  const submit = () => {
    setNotice(null);
    startTransition(async () => {
      const result = await submitCatalogReviewAction({
        targetType,
        targetId,
        restaurantSlug,
        orderId,
        rating,
        comment,
      });
      setNotice({ message: result.message, error: !result.ok });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="restaurant-review-composer">
      <div className="restaurant-review-composer__heading">
        <div><EditOutlinedIcon /><div><strong>Bình luận về {targetName}</strong><span>Đánh giá được xác minh từ đơn hàng của bạn.</span></div></div>
      </div>
      <div className="restaurant-review-composer__form">
        <TextField
          select
          size="small"
          label="Đơn hàng"
          value={orderId}
          onChange={(event) => selectOrder(event.target.value)}
        >
          {eligibleOrders.map((order) => (
            <MenuItem key={order.orderId} value={order.orderId}>{orderLabel(order)}</MenuItem>
          ))}
        </TextField>
        <div className="restaurant-review-composer__rating">
          <span>Mức độ hài lòng</span>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value || 1)}
            aria-label="Mức đánh giá"
          />
        </div>
        <TextField
          label="Bình luận"
          placeholder="Chia sẻ hương vị, chất lượng phục vụ hoặc trải nghiệm của bạn..."
          multiline
          minRows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          helperText={`${comment.trim().length}/1000 ký tự`}
        />
        {notice ? <Alert severity={notice.error ? "error" : "success"}>{notice.message}</Alert> : null}
        <Button
          type="button"
          variant="contained"
          disabled={pending || comment.trim().length < 3}
          onClick={submit}
        >
          {pending ? "Đang lưu..." : eligibleOrders.find((order) => order.orderId === orderId)?.existingRating ? "Cập nhật bình luận" : "Gửi bình luận"}
        </Button>
      </div>
    </div>
  );
}
