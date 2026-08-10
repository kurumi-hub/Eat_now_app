import { Suspense } from "react";

import SearchFilterPage from "@/components/search/SearchFilterPage";
import { getCurrentPublicUser } from "@/utils/auth/guards";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await getCurrentPublicUser();
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <Suspense fallback={<div className="search-filter-page" />}>
      <SearchFilterPage user={user} initialQuery={initialQuery} />
    </Suspense>
  );
}
