"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "./cartStore";

/**
 * Chỉ cho component đọc cart sau khi persist đã hydrate và cart đã được gắn
 * với đúng tài khoản hiện tại. Điều này ngăn dữ liệu cũ nháy lên trên UI.
 */
export function useCartSession(ownerId: string | null) {
  const bindOwner = useCartStore((state) => state.bindOwner);
  const boundOwnerId = useCartStore((state) => state.ownerId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    const syncOwner = () => {
      bindOwner(ownerId);
      setReady(true);
    };

    if (useCartStore.persist.hasHydrated()) {
      syncOwner();
    }

    const unsubscribe = useCartStore.persist.onFinishHydration(syncOwner);

    return unsubscribe;
  }, [bindOwner, ownerId]);

  return ready && boundOwnerId === ownerId;
}
