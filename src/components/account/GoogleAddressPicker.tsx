"use client";

import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

type LatLngLiteral = { lat: number; lng: number };

type MapsApi = {
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>
  ) => {
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

type GeocodingApi = {
  Geocoder: new () => {
    geocode: (
      request: Record<string, unknown>
    ) => Promise<{
      results: Array<{
        formatted_address?: string;
        geometry: { location: { lat: () => number; lng: () => number } };
      }>;
    }>;
  };
};

type MarkerApi = {
  AdvancedMarkerElement: new (options: Record<string, unknown>) => {
    position: unknown;
    addListener: (name: string, handler: () => void) => unknown;
  };
};

type GoogleMapsGlobal = {
  maps: {
    importLibrary: (
      name: "maps" | "marker" | "geocoding"
    ) => Promise<unknown>;
  };
};

type MapsWindow = Window & {
  google?: GoogleMapsGlobal;
  __eatNowGoogleMapsPromise?: Promise<GoogleMapsGlobal>;
  __eatNowGoogleMapsReady?: () => void;
};

type GoogleAddressPickerProps = {
  addressQuery: string;
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

export default function GoogleAddressPicker({
  addressQuery,
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
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  const updatePosition = useCallback((next: LatLngLiteral) => {
    setPosition(next);
    if (markerRef.current) markerRef.current.position = next;
    mapRef.current?.panTo(next);
  }, []);

  const reverseLookup = useCallback(
    async (next: LatLngLiteral) => {
      updatePosition(next);
      try {
        const response = await geocoderRef.current?.geocode({ location: next });
        setSelectedAddress(response?.results?.[0]?.formatted_address ?? "");
      } catch {
        setSelectedAddress("");
      }
    },
    [updatePosition]
  );

  useEffect(() => {
    if (!apiKey) {
      setError("Thiếu NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      setIsLoading(false);
      return;
    }

    let disposed = false;
    void (async () => {
      try {
        const google = await loadGoogleMaps(apiKey);
        const maps = (await google.maps.importLibrary("maps")) as MapsApi;
        const marker = (await google.maps.importLibrary("marker")) as MarkerApi;
        const geocoding = (await google.maps.importLibrary(
          "geocoding"
        )) as GeocodingApi;
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
    };
  }, [apiKey, mapId, reverseLookup]);

  const locateAddress = async () => {
    const query = addressQuery.trim();
    if (!query) {
      setError("Hãy nhập đầy đủ địa chỉ trước khi tìm trên bản đồ.");
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
      if (!result) {
        setError("Google Maps không tìm thấy địa chỉ này.");
        return;
      }
      const next = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      };
      updatePosition(next);
      mapRef.current?.setZoom(17);
      setSelectedAddress(result.formatted_address ?? query);
    } catch {
      setError("Không thể tìm địa chỉ trên Google Maps.");
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
        mapRef.current?.setZoom(17);
        setIsSearching(false);
      },
      () => {
        setError("Không thể lấy vị trí hiện tại. Hãy kiểm tra quyền vị trí.");
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={
            isSearching ? <CircularProgress size={14} /> : <SearchOutlinedIcon />
          }
          onClick={locateAddress}
          disabled={isLoading || isSearching || !apiKey}
        >
          Tìm trên Google Maps
        </Button>
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
            height: 280,
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

      <input type="hidden" name="lat" value={position?.lat ?? ""} />
      <input type="hidden" name="lon" value={position?.lng ?? ""} />
      {selectedAddress && (
        <Typography variant="caption" color="text.secondary">
          Ghim đã chọn: {selectedAddress}. Bạn có thể kéo ghim hoặc bấm vị trí
          khác.
        </Typography>
      )}
    </Box>
  );
}
