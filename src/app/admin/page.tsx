import RouteNotice from "@/components/common/RouteNotice";
import { requireAnyRole } from "@/utils/auth/guards";

export default async function AdminPage() {
  await requireAnyRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <RouteNotice
      eyebrow="Quản trị"
      title="Admin Dashboard"
      message="Trang này sẽ được triển khai ở Sprint tiếp theo."
      actions={[{ href: "/", label: "Về trang chủ", variant: "primary" }]}
    />
  );
}
