"use client";

import { useRouter } from "next/navigation";

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

  return (
    <CustomerHeader
      user={user}
      onSectionNavigate={(sectionId) => router.push(`/?home=1#${sectionId}`)}
    />
  );
}
