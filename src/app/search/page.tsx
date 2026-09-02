import { Suspense } from "react";

import SearchFilterPage from "@/components/search/SearchFilterPage";
import { searchFilterPageClassName } from "@/components/search/tailwindClasses";
import { getCurrentDeliveryLocationLabel } from "@/lib/data/deliveryLocation";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await getCurrentPublicUser();
  const deliveryLocationLabel = await getCurrentDeliveryLocationLabel(user);
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <Suspense fallback={<div className={searchFilterPageClassName} />}>
      <SearchFilterPage
        user={user}
        initialQuery={initialQuery}
        deliveryLocationLabel={deliveryLocationLabel}
      />
    </Suspense>
  );
}
