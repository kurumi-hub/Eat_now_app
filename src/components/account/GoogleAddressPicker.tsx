"use client";

import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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

type PlaceSelectEvent = Event & {
  placePrediction?: { toPlace: () => Place };
};

type PlaceAutocompleteElement = HTMLElement & {
  includedRegionCodes?: string[];
  requestedLanguage?: string;
  requestedRegion?: string;
  placeholder?: string;
};

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
  PlaceAutocompleteElement: new () => PlaceAutocompleteElement;
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
};

type GoogleAddressPickerProps = {
  onAddressSelect: (selection: GoogleAddressSelection) => void;
};

const DEFAULT_CENTER: LatLngLiteral = { lat: 10.0452, lng: 105.7469 };

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
    mapsWindow.__eatNowGoogleMapsReady = () => {
      if (mapsWindow.google) resolve(mapsWindow.google);
      else reject(new Error("Google Maps không khởi tạo được."));
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
    script.onerror = () => reject(new Error("Không tải được Google Maps."));
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
  const autocompleteHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<InstanceType<MapsApi["Map"]> | null>(null);
  const markerRef = useRef<
    InstanceType<MarkerApi["AdvancedMarkerElement"]> | null
  >(null);
  const geocoderRef = useRef<
    InstanceType<GeocodingApi["Geocoder"]> | null
  >(null);
  const onAddressSelectRef = useRef(onAddressSelect);
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [placesAvailable, setPlacesAvailable] = useState(true);
  const [manualQuery, setManualQuery] = useState("");
  const [error, setError] = useState("");

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
      onAddressSelectRef.current(
        parseAddress(
          nextAddress,
          nextPlaceId,
          next,
          result.address_components
        )
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
    let autocompleteElement: PlaceAutocompleteElement | null = null;
    let selectHandler: ((event: Event) => void) | null = null;

    void (async () => {
      try {
        const google = await loadGoogleMaps(apiKey);
        const [maps, marker, geocoding] = await Promise.all([
          google.maps.importLibrary("maps") as Promise<MapsApi>,
          google.maps.importLibrary("marker") as Promise<MarkerApi>,
          google.maps.importLibrary("geocoding") as Promise<GeocodingApi>,
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

        try {
          const places = (await google.maps.importLibrary("places")) as PlacesApi;
          if (!disposed && autocompleteHostRef.current) {
            autocompleteElement = new places.PlaceAutocompleteElement();
            autocompleteElement.includedRegionCodes = ["vn"];
            autocompleteElement.requestedLanguage = "vi";
            autocompleteElement.requestedRegion = "VN";
            autocompleteElement.placeholder = "Tìm số nhà, đường hoặc địa điểm";
            autocompleteElement.style.display = "block";
            autocompleteElement.style.width = "100%";

            selectHandler = (rawEvent: Event) => {
              void (async () => {
                setIsSearching(true);
                setError("");
                try {
                  const event = rawEvent as PlaceSelectEvent;
                  const place = event.placePrediction?.toPlace();
                  if (!place) throw new Error("Không đọc được địa chỉ đã chọn.");
                  await place.fetchFields({
                    fields: [
                      "id",
                      "formattedAddress",
                      "location",
                      "addressComponents",
                    ],
                  });
                  if (!place.location || !place.formattedAddress) {
                    throw new Error("Địa chỉ này chưa có tọa độ giao hàng.");
                  }
                  const next = {
                    lat: place.location.lat(),
                    lng: place.location.lng(),
                  };
                  updatePosition(next);
                  setFormattedAddress(place.formattedAddress);
                  onAddressSelectRef.current(
                    parseAddress(
                      place.formattedAddress,
                      place.id ?? "",
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
              })();
            };
            autocompleteElement.addEventListener("gmp-select", selectHandler);
            autocompleteHostRef.current.replaceChildren(autocompleteElement);
          }
        } catch {
          setPlacesAvailable(false);
        }

        setIsLoading(false);
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
      if (autocompleteElement && selectHandler) {
        autocompleteElement.removeEventListener("gmp-select", selectHandler);
      }
      autocompleteElement?.remove();
    };
  }, [apiKey, mapId, reverseLookup, updatePosition]);

  const locateManualAddress = async () => {
    const query = manualQuery.trim();
    if (!query) {
      setError("Hãy nhập địa chỉ chi tiết trước khi định vị.");
      return;
    }
    setError("");
    setIsSearching(true);
    try {
      const response = await geocoderRef.current?.geocode({
        address: query,
        componentRestrictions: { country: "VN" },
      });
      const result = response?.results?.[0];
      if (!result) throw new Error("Google Maps không tìm thấy địa chỉ này.");
      acceptGeocoderResult(result);
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Không thể tìm địa chỉ trên Google Maps."
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Typography variant="subtitle2">Tìm vị trí giao hàng</Typography>
      <Box
        ref={autocompleteHostRef}
        sx={{
          minHeight: 48,
          "& gmp-place-autocomplete": { width: "100%" },
        }}
      />

      {!placesAvailable && (
        <>
          <Alert severity="warning">
            Chưa dùng được gợi ý địa chỉ. Hãy bật Places API (New), hoặc tìm
            địa chỉ thủ công bên dưới.
          </Alert>
          <TextField
            value={manualQuery}
            onChange={(event) => setManualQuery(event.target.value)}
            placeholder="Nhập số nhà, tên đường, phường/xã"
            size="small"
            fullWidth
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void locateManualAddress();
              }
            }}
          />
        </>
      )}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {!placesAvailable && (
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={
              isSearching ? (
                <CircularProgress size={14} />
              ) : (
                <SearchOutlinedIcon />
              )
            }
            onClick={locateManualAddress}
            disabled={isLoading || isSearching || !apiKey}
          >
            Tìm địa chỉ
          </Button>
        )}
        <Button
          type="button"
          size="small"
          variant="text"
          startIcon={<MyLocationOutlinedIcon />}
          onClick={useCurrentLocation}
          disabled={isLoading || isSearching || !apiKey}
        >
          Vị trí hiện tại
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
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
        <Typography variant="caption" color="text.secondary">
          Hãy chọn một gợi ý Google, dùng vị trí hiện tại hoặc bấm trên bản đồ.
          Bạn có thể kéo ghim để chỉnh chính xác cổng giao hàng.
        </Typography>
      )}
    </Box>
  );
}
