import RouteNotice from "@/components/common/RouteNotice";
import { requireAnyRole } from "@/utils/auth/guards";

export default async function ModeratorPage() {
  await requireAnyRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]);

  return (
    <RouteNotice
      eyebrow="Điều hành nội dung"
      title="Moderator Dashboard"
      message="Khu vực xử lý báo cáo, đánh giá và nội dung vi phạm sẽ được triển khai ở phần quản trị tiếp theo."
      actions={[{ href: "/", label: "Về trang chủ", variant: "primary" }]}
    />
  );
}
