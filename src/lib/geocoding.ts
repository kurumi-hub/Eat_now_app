import "server-only";

export type GeocodeResult = {
  lat: number;
  lon: number;
  formattedAddress: string;
  placeId?: string;
};

type GoogleGeocodingResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address: string;
    place_id?: string;
    geometry?: {
      location?: { lat: number; lng: number };
    };
  }>;
};

function getGoogleMapsServerKey() {
  const key =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ??
    process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    throw new Error(
      "Thiếu GOOGLE_MAPS_SERVER_API_KEY (hoặc GOOGLE_MAPS_API_KEY)."
    );
  }
  return key;
}

async function requestGeocodingApi(
  params: URLSearchParams
): Promise<GeocodeResult | null> {
  params.set("key", getGoogleMapsServerKey());
  params.set("language", "vi");
  params.set("region", "vn");

  let response: Response;
  try {
    response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      { cache: "no-store" }
    );
  } catch {
    throw new Error("Không thể kết nối tới Google Maps.");
  }

  if (!response.ok) {
    throw new Error(`Google Maps trả về HTTP ${response.status}.`);
  }

  const data = (await response.json()) as GoogleGeocodingResponse;
  if (data.status === "ZERO_RESULTS") return null;
  if (data.status !== "OK") {
    throw new Error(
      data.error_message || `Google Maps Geocoding lỗi: ${data.status}`
    );
  }

  const result = data.results?.[0];
  const location = result?.geometry?.location;
  if (!result || !location) return null;

  const lat = Number(location.lat);
  const lon = Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return {
    lat,
    lon,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
}

/** Geocode địa chỉ bằng Google Maps Geocoding API, chỉ chạy trên server. */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;
  return requestGeocodingApi(
    new URLSearchParams({
      address: trimmed,
      components: "country:VN",
    })
  );
}

/** Xác minh một địa chỉ Google đã chọn bằng place_id ở phía server. */
export async function geocodePlaceId(
  placeId: string
): Promise<GeocodeResult | null> {
  const trimmed = placeId.trim();
  if (!trimmed) return null;
  return requestGeocodingApi(
    new URLSearchParams({
      place_id: trimmed,
    })
  );
}

export function isValidCoordinate(lat: number, lon: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/** Khoảng cách đường chim bay, dùng để kiểm tra ghim không lệch địa chỉ. */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Xác minh lại lựa chọn Google Maps ở server trước khi dùng cho nghiệp vụ. */
export async function verifyGoogleAddressSelection(input: {
  address: string;
  placeId?: string;
  lat: number;
  lon: number;
}) {
  if (!input.address.trim() || !isValidCoordinate(input.lat, input.lon)) {
    throw new Error("Địa chỉ hoặc tọa độ Google Maps không hợp lệ.");
  }
  const geo = input.placeId?.trim()
    ? await geocodePlaceId(input.placeId)
    : await geocodeAddress(input.address);
  if (!geo) {
    throw new Error("Không tìm thấy địa chỉ nhà hàng trên Google Maps.");
  }
  if (distanceKm(geo.lat, geo.lon, input.lat, input.lon) > 1.5) {
    throw new Error("Vị trí ghim cách địa chỉ Google quá xa. Hãy chọn lại vị trí.");
  }
  return geo;
}
