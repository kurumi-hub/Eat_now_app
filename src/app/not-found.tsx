import RouteNotice from "@/components/common/RouteNotice";

export default function NotFound() {
  return (
    <RouteNotice
      eyebrow="404"
      title="Không tìm thấy trang"
      message="Trang bạn đang tìm không tồn tại hoặc đã được di chuyển."
      actions={[{ href: "/", label: "Về trang chủ", variant: "primary" }]}
    />
  );
}
