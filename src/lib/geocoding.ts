export type GeocodeResult = {
  lat: number;
  lon: number;
  formattedAddress: string;
};

// Nominatim yêu cầu rate-limit tối đa ~1 request/giây từ 1 nguồn, và bắt
// buộc phải gửi User-Agent định danh ứng dụng (không được dùng UA mặc định
// của fetch). Xem: https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? "EatNowApp/1.0 (test@example.com)";

/**
 * Chuyển địa chỉ dạng text sang toạ độ (lat/lon) bằng Nominatim (OpenStreetMap).
 * Dùng server-side only -- KHÔNG import file này trong component "use client".
 *
 * Lưu ý:
 * - Instance công khai này miễn phí, không cần đăng ký/API key, nhưng chỉ
 *   phù hợp cho môi trường test/traffic thấp. Nếu lên production với lượng
 *   truy vấn lớn, nên tự host Nominatim hoặc chuyển sang nhà cung cấp trả phí.
 * - Không được gọi dồn dập (rate limit ~1 req/giây) -- vì geocode chỉ chạy
 *   1 lần khi user lưu địa chỉ mới nên không đáng lo trong luồng hiện tại.
 *
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    countrycodes: "vn",
    limit: "1",
    addressdetails: "0",
  });

  let res: Response;
  try {
    res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": NOMINATIM_USER_AGENT,
          // Nominatim khuyến nghị gửi Accept-Language để ưu tiên kết quả
          // hiển thị tiếng Việt khi có.
          "Accept-Language": "vi",
        },
        cache: "no-store",
      }
    );
  } catch {
    throw new Error("Không thể kết nối tới dịch vụ định vị địa chỉ.");
  }

  if (!res.ok) {
    throw new Error("Dịch vụ định vị địa chỉ đang gặp sự cố.");
  }

  const data = await res.json();

  if (!Array.isArray(data) || !data[0]) {
    return null;
  }

  const result = data[0];
  const lat = Number(result.lat);
  const lon = Number(result.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return {
    lat,
    lon,
    formattedAddress: result.display_name ?? trimmed,
  };
}
