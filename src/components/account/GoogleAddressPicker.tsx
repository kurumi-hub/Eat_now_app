"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

type LatLngLiteral = { lat: number; lng: number };

export type GoogleAddressSelection = {
  formattedAddress: string;
  placeId: string;
  lat: number;
  lon: number;
  line1: string;
  ward: string;
  district: string;
  city: string;
};

type AddressComponent = {
  longText?: string;
  long_name?: string;
  types: string[];
};

type Place = {
  id?: string;
  formattedAddress?: string;
  location?: { lat: () => number; lng: () => number };
  addressComponents?: AddressComponent[];
  fetchFields: (options: { fields: string[] }) => Promise<void>;
};

type AutocompleteSuggestion = {
  placePrediction?: {
    placeId: string;
    text?: { text?: string };
    mainText?: { text?: string };
    secondaryText?: { text?: string };
    toPlace: () => Place;
  };
};

type AutocompleteSessionToken = new () => unknown;

type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => {
    addListener: (
      name: string,
      handler: (event: {
        latLng?: { lat: () => number; lng: () => number };
      }) => void
    ) => unknown;
    panTo: (position: LatLngLiteral) => void;
    setZoom: (zoom: number) => void;
  };
};

type GeocodingResult = {
  formatted_address?: string;
  place_id?: string;
  address_components?: AddressComponent[];
  geometry: { location: { lat: () => number; lng: () => number } };
};

type GeocodingApi = {
  Geocoder: new () => {
    geocode: (request: Record<string, unknown>) => Promise<{
      results: GeocodingResult[];
    }>;
  };
};

type MarkerApi = {
  AdvancedMarkerElement: new (options: Record<string, unknown>) => {
    position: unknown;
    addListener: (name: string, handler: () => void) => unknown;
  };
};

type PlacesApi = {
  AutocompleteSessionToken: AutocompleteSessionToken;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (
      request: Record<string, unknown>
    ) => Promise<{ suggestions: AutocompleteSuggestion[] }>;
  };
};

type GoogleMapsGlobal = {
  maps: {
    importLibrary: (
      name: "maps" | "marker" | "geocoding" | "places"
    ) => Promise<unknown>;
  };
};

type MapsWindow = Window & {
  google?: GoogleMapsGlobal;
  __eatNowGoogleMapsPromise?: Promise<GoogleMapsGlobal>;
  __eatNowGoogleMapsReady?: () => void;
  gm_authFailure?: () => void;
};

type GoogleAddressPickerProps = {
  onAddressSelect: (selection: GoogleAddressSelection) => void;
};

const DEFAULT_CENTER: LatLngLiteral = { lat: 10.0452, lng: 105.7469 };
const AUTH_FAILURE_MESSAGE =
  "Google từ chối khoá API Maps (sai key, chưa bật billing, chưa bật đủ API, hoặc bị chặn theo HTTP referrer/domain). Vui lòng kiểm tra lại cấu hình trong Google Cloud Console.";

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsGlobal> {
  const mapsWindow = window as MapsWindow;
  if (mapsWindow.google?.maps?.importLibrary) {
    return Promise.resolve(mapsWindow.google);
  }
  if (mapsWindow.__eatNowGoogleMapsPromise) {
    return mapsWindow.__eatNowGoogleMapsPromise;
  }

  const promise = new Promise<GoogleMapsGlobal>((resolve, reject) => {
    const script = document.createElement("script");
    // Nếu load thất bại (mất mạng tạm thời, lỗi tạm thời, hoặc bị Google từ
    // chối khoá API), phải xoá promise đã cache khỏi window; nếu không, mọi
    // lần mount lại GoogleAddressPicker sau đó sẽ nhận ngay promise reject cũ
    // và không bao giờ thử tải lại được cho đến khi F5 cả trang.
    const clearCacheAndReject = (error: Error) => {
      if (mapsWindow.__eatNowGoogleMapsPromise === promise) {
        mapsWindow.__eatNowGoogleMapsPromise = undefined;
      }
      script.remove();
      reject(error);
    };
    // Google gọi window.gm_authFailure() khi khoá API bị từ chối (sai key,
    // chưa bật billing, API chưa bật, hoặc referrer bị chặn). Đây KHÔNG phải
    // lỗi mạng nên script.onerror không bắt được — phải lắng nghe riêng.
    // Đây chính là nguyên nhân của màn hình đỏ "Trang này đã không tải được
    // Google Maps đúng cách" mà Google tự vẽ đè lên khung bản đồ.
    mapsWindow.gm_authFailure = () => {
      clearCacheAndReject(new Error(AUTH_FAILURE_MESSAGE));
    };
    mapsWindow.__eatNowGoogleMapsReady = () => {
      if (mapsWindow.google) resolve(mapsWindow.google);
      else clearCacheAndReject(new Error("Google Maps không khởi tạo được."));
    };
    script.src =
      "https://maps.googleapis.com/maps/api/js?" +
      new URLSearchParams({
        key: apiKey,
        v: "weekly",
        language: "vi",
        region: "VN",
        loading: "async",
        callback: "__eatNowGoogleMapsReady",
      }).toString();
    script.async = true;
    script.onerror = () =>
      clearCacheAndReject(new Error("Không tải được Google Maps."));
    document.head.appendChild(script);
  });
  mapsWindow.__eatNowGoogleMapsPromise = promise;
  return promise;
}

function readMarkerPosition(position: unknown): LatLngLiteral | null {
  if (!position || typeof position !== "object") return null;
  const value = position as {
    lat?: number | (() => number);
    lng?: number | (() => number);
  };
  const lat = typeof value.lat === "function" ? value.lat() : value.lat;
  const lng = typeof value.lng === "function" ? value.lng() : value.lng;
  return typeof lat === "number" && typeof lng === "number"
    ? { lat, lng }
    : null;
}

function componentValue(
  components: AddressComponent[] | undefined,
  ...types: string[]
) {
  const component = components?.find((item) =>
    types.some((type) => item.types.includes(type))
  );
  return component?.longText ?? component?.long_name ?? "";
}

function parseAddress(
  formattedAddress: string,
  placeId: string,
  position: LatLngLiteral,
  components?: AddressComponent[]
): GoogleAddressSelection {
  const streetNumber = componentValue(components, "street_number");
  const route = componentValue(components, "route");
  const premise = componentValue(components, "premise", "subpremise");
  const line1 =
    [premise, streetNumber, route].filter(Boolean).join(" ") ||
    formattedAddress.split(",")[0]?.trim() ||
    formattedAddress;

  return {
    formattedAddress,
    placeId,
    lat: position.lat,
    lon: position.lng,
    line1,
    ward: componentValue(
      components,
      "administrative_area_level_3",
      "sublocality_level_1",
      "sublocality"
    ),
    district: componentValue(components, "administrative_area_level_2"),
    city: componentValue(
      components,
      "administrative_area_level_1",
      "locality"
    ),
  };
}

export default function GoogleAddressPicker({
  onAddressSelect,
}: GoogleAddressPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<InstanceType<MapsApi["Map"]> | null>(null);
  const markerRef = useRef<
    InstanceType<MarkerApi["AdvancedMarkerElement"]> | null
  >(null);
  const geocoderRef = useRef<
    InstanceType<GeocodingApi["Geocoder"]> | null
  >(null);
  const placesRef = useRef<PlacesApi | null>(null);
  const sessionTokenRef = useRef<unknown>(null);
  const searchRequestId = useRef(0);
  const onAddressSelectRef = useRef(onAddressSelect);

  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [rawConsoleErrors, setRawConsoleErrors] = useState<string[]>([]);

  // --- Ô tìm kiếm kiểu app giao đồ ăn: gõ -> danh sách gợi ý xổ xuống ---
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>(
    []
  );
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  const updatePosition = useCallback((next: LatLngLiteral) => {
    setPosition(next);
    if (markerRef.current) markerRef.current.position = next;
    mapRef.current?.panTo(next);
    mapRef.current?.setZoom(17);
  }, []);

  const acceptGeocoderResult = useCallback(
    (result: GeocodingResult, fallbackPosition?: LatLngLiteral) => {
      const next = fallbackPosition ?? {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      };
      const nextAddress = result.formatted_address ?? "";
      const nextPlaceId = result.place_id ?? "";
      updatePosition(next);
      setFormattedAddress(nextAddress);
      setQuery(nextAddress);
      onAddressSelectRef.current(
        parseAddress(nextAddress, nextPlaceId, next, result.address_components)
      );
    },
    [updatePosition]
  );

  const reverseLookup = useCallback(
    async (next: LatLngLiteral) => {
      updatePosition(next);
      setIsSearching(true);
      try {
        const response = await geocoderRef.current?.geocode({ location: next });
        const result = response?.results?.[0];
        if (!result) throw new Error("Không tìm thấy địa chỉ tại vị trí này.");
        acceptGeocoderResult(result, next);
        setError("");
      } catch (lookupError) {
        setError(
          lookupError instanceof Error
            ? lookupError.message
            : "Không thể nhận diện địa chỉ tại vị trí này."
        );
      } finally {
        setIsSearching(false);
      }
    },
    [acceptGeocoderResult, updatePosition]
  );

  useEffect(() => {
    if (!apiKey) {
      setError("Thiếu NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      setIsLoading(false);
      return;
    }

    let disposed = false;

    // LỚP 1: Google Maps thường KHÔNG throw lỗi ra ngoài mà chỉ in chi tiết
    // qua console.error (vd InvalidKeyMapError, ApiNotActivatedMapError,
    // RefererNotAllowedMapError, ApiTargetBlockedMapError...), và việc này
    // có thể xảy ra MUỘN — sau khi tile bắt đầu tải, không phải ngay lúc
    // khởi tạo — nên phải chặn console.error suốt vòng đời component,
    // không tắt sớm.
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      try {
        const text = args
          .map((arg) =>
            typeof arg === "string" ? arg : JSON.stringify(arg)
          )
          .join(" ");
        if (/maps|google|api key|referer|billing/i.test(text) && !disposed) {
          setRawConsoleErrors((prev) =>
            prev.includes(text) ? prev : [...prev, text]
          );
        }
      } catch {
        // ignore serialization errors
      }
      originalConsoleError.apply(console, args);
    };

    // LỚP 2: Khi lỗi kiểu ApiNotActivatedMapError/RefererNotAllowed/billing
    // xảy ra, Google tự vẽ đè 1 lớp thông báo NGAY BÊN TRONG div bản đồ
    // (không throw, không chắc lúc nào cũng log console) — quét thẳng nội
    // dung DOM của khung bản đồ để bắt được chắc chắn, không phụ thuộc gì
    // vào console hay các extension trình duyệt có thể che log.
    let domObserver: MutationObserver | null = null;
    const watchMapOverlayError = () => {
      if (!mapElementRef.current) return;
      domObserver = new MutationObserver(() => {
        const text = mapElementRef.current?.textContent?.trim() ?? "";
        if (
          text &&
          /didn't load google maps correctly|không tải.*google maps|oops|đã xảy ra lỗi/i.test(
            text
          )
        ) {
          setRawConsoleErrors((prev) =>
            prev.includes(text) ? prev : [...prev, `[DOM overlay] ${text}`]
          );
        }
      });
      domObserver.observe(mapElementRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    void (async () => {
      try {
        const google = await loadGoogleMaps(apiKey);
        const [maps, marker, geocoding, places] = await Promise.all([
          google.maps.importLibrary("maps") as Promise<MapsApi>,
          google.maps.importLibrary("marker") as Promise<MarkerApi>,
          google.maps.importLibrary("geocoding") as Promise<GeocodingApi>,
          google.maps.importLibrary("places") as Promise<PlacesApi>,
        ]);
        if (disposed || !mapElementRef.current) return;

        const mapInstance = new maps.Map(mapElementRef.current, {
          center: DEFAULT_CENTER,
          zoom: 13,
          mapId,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        const markerInstance = new marker.AdvancedMarkerElement({
          map: mapInstance,
          position: DEFAULT_CENTER,
          gmpDraggable: true,
          title: "Vị trí giao hàng",
        });

        mapRef.current = mapInstance;
        markerRef.current = markerInstance;
        geocoderRef.current = new geocoding.Geocoder();
        placesRef.current = places;
        sessionTokenRef.current = new places.AutocompleteSessionToken();

        watchMapOverlayError();

        mapInstance.addListener("click", (event) => {
          if (!event.latLng) return;
          void reverseLookup({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
        });
        markerInstance.addListener("dragend", () => {
          const next = readMarkerPosition(markerInstance.position);
          if (next) void reverseLookup(next);
        });

        // Chỉ tắt loading khi bản đồ đã thực sự render xong tile (tilesloaded),
        // không tắt ngay sau khi khởi tạo object — nếu không spinner biến mất
        // trong khi khung bản đồ vẫn còn trắng/đang tải tile bên dưới.
        let settled = false;
        const finishLoading = () => {
          if (settled) return;
          settled = true;
          if (!disposed) setIsLoading(false);
        };
        mapInstance.addListener("tilesloaded", finishLoading);
        // Fallback: nếu vì lý do gì đó tilesloaded không bắn (mạng chập chờn,
        // tile server lỗi...), vẫn phải tắt spinner sau một khoảng hợp lý để
        // không treo UI vĩnh viễn.
        setTimeout(finishLoading, 4000);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể khởi tạo Google Maps."
        );
        setIsLoading(false);
      }
    })();

    return () => {
      disposed = true;
      console.error = originalConsoleError;
      domObserver?.disconnect();
    };
  }, [apiKey, mapId, reverseLookup]);

  // Debounce gọi Places AutocompleteSuggestion mỗi khi người dùng gõ.
  useEffect(() => {
    const trimmed = query.trim();
    if (!placesRef.current || trimmed.length < 3) {
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return;
    }

    const requestId = ++searchRequestId.current;
    setIsFetchingSuggestions(true);
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response =
            await placesRef.current!.AutocompleteSuggestion.fetchAutocompleteSuggestions(
              {
                input: trimmed,
                includedRegionCodes: ["vn"],
                language: "vi",
                region: "vn",
                sessionToken: sessionTokenRef.current,
              }
            );
          if (searchRequestId.current !== requestId) return;
          setSuggestions(response.suggestions ?? []);
          setSuggestionsOpen(true);
        } catch {
          if (searchRequestId.current !== requestId) return;
          setSuggestions([]);
        } finally {
          if (searchRequestId.current === requestId) {
            setIsFetchingSuggestions(false);
          }
        }
      })();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePickSuggestion = async (suggestion: AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    setSuggestionsOpen(false);
    setIsSearching(true);
    setError("");
    try {
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["id", "formattedAddress", "location", "addressComponents"],
      });
      if (!place.location || !place.formattedAddress) {
        throw new Error("Địa chỉ này chưa có tọa độ giao hàng.");
      }
      const next = { lat: place.location.lat(), lng: place.location.lng() };
      updatePosition(next);
      setFormattedAddress(place.formattedAddress);
      setQuery(place.formattedAddress);
      // Mỗi lượt tìm kiếm hoàn tất nên đổi session token mới (đúng khuyến
      // nghị billing của Google cho Autocomplete + Place Details).
      if (placesRef.current) {
        sessionTokenRef.current = new placesRef.current.AutocompleteSessionToken();
      }
      onAddressSelectRef.current(
        parseAddress(
          place.formattedAddress,
          place.id ?? prediction.placeId ?? "",
          next,
          place.addressComponents
        )
      );
    } catch (placeError) {
      setError(
        placeError instanceof Error
          ? placeError.message
          : "Không thể dùng địa chỉ đã chọn."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ lấy vị trí hiện tại.");
      return;
    }
    setError("");
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void reverseLookup({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        setError("Không thể lấy vị trí hiện tại. Hãy kiểm tra quyền vị trí.");
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const isAuthFailure = error === AUTH_FAILURE_MESSAGE;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Typography variant="subtitle2">Tìm vị trí giao hàng</Typography>

      <ClickAwayListener onClickAway={() => setSuggestionsOpen(false)}>
        <Box sx={{ position: "relative" }}>
          <TextField
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setSuggestionsOpen(true);
            }}
            placeholder="Tìm số nhà, đường hoặc địa điểm"
            size="small"
            fullWidth
            disabled={isLoading || !apiKey || isAuthFailure}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isFetchingSuggestions ? (
                      <CircularProgress size={16} />
                    ) : query ? (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setQuery("");
                          setSuggestions([]);
                        }}
                      >
                        <CloseOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
              },
            }}
          />

          {suggestionsOpen && suggestions.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                mt: 0.5,
                zIndex: 1400,
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              <List dense disablePadding>
                {suggestions.map((suggestion, index) => {
                  const prediction = suggestion.placePrediction;
                  if (!prediction) return null;
                  const key = prediction.placeId || String(index);
                  return (
                    <ListItemButton
                      key={key}
                      onClick={() => void handlePickSuggestion(suggestion)}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <PlaceOutlinedIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          prediction.mainText?.text ?? prediction.text?.text
                        }
                        secondary={prediction.secondaryText?.text}
                        slotProps={{
                          primary: { variant: "body2" },
                          secondary: { variant: "caption" },
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          )}
        </Box>
      </ClickAwayListener>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          type="button"
          size="small"
          variant="text"
          startIcon={<MyLocationOutlinedIcon />}
          onClick={useCurrentLocation}
          disabled={isLoading || isSearching || !apiKey || isAuthFailure}
        >
          Vị trí hiện tại
        </Button>
      </Box>

      {error && (
        <Alert severity="error">
          {error}
          {isAuthFailure && (
            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
              Kiểm tra: khoá API đúng dự án, đã bật Billing, đã bật Maps
              JavaScript API + Places API (New) + Geocoding API, và domain
              hiện tại nằm trong danh sách HTTP referrer được phép.
            </Typography>
          )}
        </Alert>
      )}

      {rawConsoleErrors.length > 0 && (
        <Alert severity="warning">
          <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
            Lỗi gốc từ Google Maps (bắt trực tiếp từ console.error):
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              mt: 0.5,
              p: 1,
              bgcolor: "rgba(0,0,0,0.04)",
              borderRadius: 1,
              fontSize: 11,
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 160,
              overflowY: "auto",
            }}
          >
            {rawConsoleErrors.join("\n\n")}
          </Box>
        </Alert>
      )}

      <Box sx={{ position: "relative" }}>
        <Box
          ref={mapElementRef}
          sx={{
            height: 300,
            width: "100%",
            borderRadius: 2,
            bgcolor: "grey.100",
          }}
        />
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,.72)",
              borderRadius: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
      </Box>

      {formattedAddress ? (
        <Alert severity="success" icon={<SearchOutlinedIcon />}>
          <strong>Vị trí đã xác nhận:</strong> {formattedAddress}
        </Alert>
      ) : (
        !error && (
          <Typography variant="caption" color="text.secondary">
            Hãy chọn một gợi ý, dùng vị trí hiện tại hoặc bấm trên bản đồ. Bạn
            có thể kéo ghim để chỉnh chính xác cổng giao hàng.
          </Typography>
        )
      )}
    </Box>
  );
}
