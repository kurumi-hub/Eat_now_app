"use client";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { Alert, Badge, IconButton, Menu, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PublicUser } from "@/types/auth";
import { createClient } from "@/utils/supabase/client";
import { hasAnyRole, hasRole } from "@/utils/roles";

type NotificationItem = {
  id: string;
  title: string;
  content: string;
  ref_type: string | null;
  ref_id: string | null;
  is_read: boolean;
  created_at: string;
};

function notificationHref(user: PublicUser, item: NotificationItem) {
  if (item.ref_type !== "order" || !item.ref_id) return "/account/preferences";
  if (hasRole(user, "SHIPPER")) return "/shipper";
  if (hasAnyRole(user, ["RESTAURANT_OWNER", "RESTAURANT_STAFF"])) return "/owner?tab=orders";
  return `/orders/${item.ref_id}`;
}

function relativeTime(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(delta)) return "";
  if (delta < 60_000) return "Vừa xong";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} phút trước`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} giờ trước`;
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function NotificationCenter({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const [realtimeState, setRealtimeState] = useState<"connecting" | "live" | "retrying">("connecting");
  const lastTopId = useRef("");

  const load = useCallback(async (showToast = false) => {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("api_list_my_notifications", {
      p_limit: 30,
      p_before: null,
    });
    if (rpcError) {
      setError("Không thể tải thông báo. Hãy kiểm tra SQL 46 và kết nối Realtime.");
      return;
    }
    const response = data && typeof data === "object" && !Array.isArray(data)
      ? data as { items?: unknown; unread_count?: unknown }
      : {};
    const nextItems = Array.isArray(response.items)
      ? response.items as NotificationItem[]
      : [];
    const nextTopId = nextItems[0]?.id || "";
    if (showToast && nextTopId && lastTopId.current && nextTopId !== lastTopId.current) {
      setToast(nextItems[0]);
    }
    lastTopId.current = nextTopId;
    setItems(nextItems);
    setUnread(Math.max(0, Number(response.unread_count) || 0));
    setError("");
  }, []);

  useEffect(() => {
    void load(false);
    const supabase = createClient();
    const refreshTimer = window.setInterval(() => void load(false), 20_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load(false);
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const channel = supabase
      .channel(`user:${user.id}:notifications`, { config: { private: true } })
      .on(
        "broadcast",
        { event: "notification_changed" },
        () => void load(true)
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeState("live");
        } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
          setRealtimeState("retrying");
        }
      });
    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [load, user.id]);

  const markRead = async (item: NotificationItem) => {
    if (!item.is_read) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, is_read: true } : value));
      setUnread((value) => Math.max(0, value - 1));
      const supabase = createClient();
      const { error: markError } = await supabase.rpc("api_mark_notification_read", {
        p_notification_id: item.id,
      });
      if (markError) {
        setError("Không thể đánh dấu thông báo đã đọc.");
        void load(false);
      }
    }
    setAnchor(null);
    router.push(notificationHref(user, item));
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnread(0);
    const supabase = createClient();
    const { error: markError } = await supabase.rpc("api_mark_all_notifications_read");
    if (markError) {
      setError("Không thể đánh dấu tất cả thông báo đã đọc.");
      void load(false);
    }
  };

  return (
    <>
      <IconButton
        aria-label={unread ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
        className="home-notification-button"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <Badge badgeContent={unread} max={99} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { className: "notification-menu" } }}
      >
        <div className="notification-menu__heading">
          <div><strong>Thông báo</strong><span>{unread ? `${unread} chưa đọc` : "Đã đọc hết"} · {realtimeState === "live" ? "Trực tiếp" : realtimeState === "retrying" ? "Đang kết nối lại" : "Đang kết nối"}</span></div>
          {unread ? <button type="button" onClick={markAllRead}>Đọc tất cả</button> : null}
        </div>
        <div className="notification-menu__list">
          {error ? <div className="notification-menu__error" role="alert">{error}<button type="button" onClick={() => void load(false)}>Thử lại</button></div> : null}
          {items.length ? items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.is_read ? "" : "is-unread"}
              onClick={() => void markRead(item)}
            >
              <i aria-hidden="true" />
              <span><strong>{item.title}</strong><span>{item.content}</span><small>{relativeTime(item.created_at)}</small></span>
            </button>
          )) : <p>Chưa có thông báo.</p>}
        </div>
      </Menu>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info" variant="filled" onClose={() => setToast(null)}>
          <strong>{toast?.title}</strong>{toast ? ` · ${toast.content}` : ""}
        </Alert>
      </Snackbar>
    </>
  );
}
