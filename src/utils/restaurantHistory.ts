export type RememberedRestaurant = {
  slug: string;
  name: string;
  image: string;
  rating: string;
  deliveryTime: string;
  viewedAt: number;
};

const RECENT_KEY = "eatnow-recent-restaurants";
const FAVORITE_KEY = "eatnow-favorite-restaurants";

function read(key: string): RememberedRestaurant[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item) => item?.slug && item?.name) : [];
  } catch {
    return [];
  }
}

function write(key: string, items: RememberedRestaurant[]) {
  window.localStorage.setItem(key, JSON.stringify(items.slice(0, 12)));
  window.dispatchEvent(new CustomEvent("eatnow-restaurant-memory"));
}

export const getRecentRestaurants = () => read(RECENT_KEY);
export const getFavoriteRestaurants = () => read(FAVORITE_KEY);
export const isFavoriteRestaurant = (slug: string) =>
  read(FAVORITE_KEY).some((item) => item.slug === slug);

export function rememberRestaurant(item: Omit<RememberedRestaurant, "viewedAt">) {
  write(RECENT_KEY, [
    { ...item, viewedAt: Date.now() },
    ...read(RECENT_KEY).filter((entry) => entry.slug !== item.slug),
  ]);
}

export function toggleFavoriteRestaurant(item: Omit<RememberedRestaurant, "viewedAt">) {
  const current = read(FAVORITE_KEY);
  const isFavorite = current.some((entry) => entry.slug === item.slug);
  write(FAVORITE_KEY, isFavorite
    ? current.filter((entry) => entry.slug !== item.slug)
    : [{ ...item, viewedAt: Date.now() }, ...current]);
  return !isFavorite;
}
