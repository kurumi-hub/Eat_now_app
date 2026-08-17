"use client";

import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CustomerHeader from "@/components/home/CustomerHeader";
import type { PublicUser } from "@/types/auth";

type OrderPageHeaderProps = {
  user: PublicUser;
};

/**
 * Client boundary cho header của trang đơn hàng.
 * Server Component chỉ truyền dữ liệu user; các event handler được tạo ở đây
 * để không vi phạm quy tắc serialize props của React Server Components.
 */
export default function OrderPageHeader({ user }: OrderPageHeaderProps) {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  return (
    <>
      <CustomerHeader
        user={user}
        onPlaceholder={setNotice}
        onSectionNavigate={(sectionId) => router.push(`/#${sectionId}`)}
      />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      </Snackbar>
    </>
  );
}
