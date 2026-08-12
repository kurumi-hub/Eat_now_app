import RouteNotice from "@/components/common/RouteNotice";
import { requireAnyRole } from "@/utils/auth/guards";

export default async function OwnerPage() {
  await requireAnyRole(["RESTAURANT_OWNER"]);

  return (
    <RouteNotice
      eyebrow="Kênh người bán"
      title="Owner Dashboard"
      message="Trang này sẽ được triển khai ở Sprint tiếp theo."
      actions={[{ href: "/", label: "Về trang chủ", variant: "primary" }]}
    />
  );
}
