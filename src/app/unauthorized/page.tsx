import RouteNotice from "@/components/common/RouteNotice";

export default function UnauthorizedPage() {
  return (
    <RouteNotice
      eyebrow="Không có quyền"
      title="Bạn không thể truy cập trang này"
      message="Tài khoản hiện tại chưa có quyền phù hợp để mở khu vực này."
      actions={[
        { href: "/", label: "Về trang chủ", variant: "primary" },
        { href: "/account/profile", label: "Tài khoản của tôi" },
      ]}
    />
  );
}
