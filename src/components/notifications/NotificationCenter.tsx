"use client";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { Alert, Badge, IconButton, Menu, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

  const load = useCallback(async () => {
    const supabase = createClient();
    const [listResult, countResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("id,title,content,ref_type,ref_id,is_read,created_at")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false),
    ]);
    if (!listResult.error) setItems((listResult.data || []) as NotificationItem[]);
    if (!countResult.error) setUnread(countResult.count || 0);
  }, [user.id]);

  useEffect(() => {
    void load();
    const supabase = createClient();
    const channel = supabase
      .channel(`notification-center-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const next = payload.new as NotificationItem;
          setItems((current) => [next, ...current.filter((item) => item.id !== next.id)].slice(0, 30));
          if (!next.is_read) setUnread((value) => value + 1);
          setToast(next);
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load, user.id]);

  const markRead = async (item: NotificationItem) => {
    if (!item.is_read) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, is_read: true } : value));
      setUnread((value) => Math.max(0, value - 1));
      const supabase = createClient();
      await supabase.from("notifications").update({ is_read: true }).eq("id", item.id).eq("receiver_id", user.id);
    }
    setAnchor(null);
    router.push(notificationHref(user, item));
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnread(0);
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("receiver_id", user.id).eq("is_read", false);
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
          <div><strong>Thông báo</strong><span>{unread ? `${unread} chưa đọc` : "Đã đọc hết"}</span></div>
          {unread ? <button type="button" onClick={markAllRead}>Đọc tất cả</button> : null}
        </div>
        <div className="notification-menu__list">
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
