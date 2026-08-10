import HomePage from "@/components/home/HomePage";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function Home() {
  const user = await getCurrentPublicUser();

  return <HomePage user={user} />;
}
