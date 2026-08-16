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
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  longText?: string | null;
  long_name?: string;
  types: string[];
};

type GoogleAddressPickerProps = {
  onAddressSelect: (selection: GoogleAddressSelection) => void;
};

type PickerContentProps = GoogleAddressPickerProps & {
  providerError: string;
};

const DEFAULT_CENTER: LatLngLiteral = { lat: 10.0452, lng: 105.7469 };
const GOOGLE_MAPS_LIBRARIES = ["places", "geocoding"];

function normalizePublicApiKey(rawValue: string) {
  let value = rawValue.trim();
  const assignment = value.match(
    /^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\s*=\s*(.+)$/
  );
  const assignedValue = assignment?.[1];
  if (assignedValue) value = assignedValue.trim();

  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
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

function GoogleAddressPickerContent({
  onAddressSelect,
  providerError,
}: PickerContentProps) {
  const map = useMap();
  const geocodingLibrary = useMapsLibrary("geocoding");
  const placesLibrary = useMapsLibrary("places");
  const geocoder = useMemo(
    () => geocodingLibrary && new geocodingLibrary.Geocoder(),
    [geocodingLibrary]
  );
  const sessionTokenRef = useRef<
    google.maps.places.AutocompleteSessionToken | undefined
  >(undefined);
  const searchRequestId = useRef(0);
  const onAddressSelectRef = useRef(onAddressSelect);

  const [formattedAddress, setFormattedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  useEffect(() => {
    if (placesLibrary && !sessionTokenRef.current) {
      sessionTokenRef.current =
        new placesLibrary.AutocompleteSessionToken();
    }
  }, [placesLibrary]);

  const updatePosition = useCallback(
    (next: LatLngLiteral) => {
      map?.panTo(next);
      map?.setZoom(17);
    },
    [map]
  );

  const acceptGeocoderResult = useCallback(
    (
      result: google.maps.GeocoderResult,
      fallbackPosition?: LatLngLiteral
    ) => {
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
      if (!geocoder) {
        setError("Google Geocoding chưa sẵn sàng.");
        return;
      }

      updatePosition(next);
      setIsSearching(true);
      try {
        const response = await geocoder.geocode({ location: next });
        const result = response.results?.[0];
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
    [acceptGeocoderResult, geocoder, updatePosition]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (!placesLibrary || trimmed.length < 3) {
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
            await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(
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
        } catch (suggestionError) {
          if (searchRequestId.current !== requestId) return;
          setSuggestions([]);
          setError(
            suggestionError instanceof Error
              ? suggestionError.message
              : "Không tải được gợi ý địa chỉ."
          );
        } finally {
          if (searchRequestId.current === requestId) {
            setIsFetchingSuggestions(false);
          }
        }
      })();
    }, 300);

    return () => clearTimeout(timer);
  }, [placesLibrary, query]);

  const handlePickSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
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

      const next = {
        lat: place.location.lat(),
        lng: place.location.lng(),
      };
      updatePosition(next);
      setFormattedAddress(place.formattedAddress);
      setQuery(place.formattedAddress);

      if (placesLibrary) {
        sessionTokenRef.current =
          new placesLibrary.AutocompleteSessionToken();
      }

      onAddressSelectRef.current(
        parseAddress(
          place.formattedAddress,
          place.id ?? prediction.placeId ?? "",
          next,
          place.addressComponents ?? undefined
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

  const librariesReady = Boolean(map && geocoder && placesLibrary);
  const blockingError = providerError || error;

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
            disabled={!librariesReady || Boolean(providerError)}
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
          disabled={!librariesReady || isSearching || Boolean(providerError)}
        >
          Vị trí hiện tại
        </Button>
      </Box>

      {blockingError && <Alert severity="error">{blockingError}</Alert>}

      <Box
        sx={{
          position: "relative",
          height: 300,
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          bgcolor: "grey.100",
        }}
      >
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={13}
          renderingType="RASTER"
          gestureHandling="greedy"
          disableDefaultUI
          clickableIcons={false}
          onClick={(event) => {
            const next = event.detail.latLng;
            if (next) void reverseLookup(next);
          }}
          onDragend={(event) => {
            const center = event.map.getCenter();
            if (!center) return;
            void reverseLookup({ lat: center.lat(), lng: center.lng() });
          }}
          onTilesLoaded={() => setIsLoading(false)}
        />

        {!providerError && (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              zIndex: 2,
              pointerEvents: "none",
              transform: "translate(-50%, -100%)",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,.35))",
            }}
          >
            <PlaceOutlinedIcon sx={{ color: "error.main", fontSize: 44 }} />
          </Box>
        )}

        {isLoading && !providerError && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,.72)",
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
        !blockingError && (
          <Typography variant="caption" color="text.secondary">
            Hãy chọn một gợi ý, dùng vị trí hiện tại hoặc bấm trên bản đồ. Kéo
            bản đồ để đặt ghim giữa đúng cổng giao hàng.
          </Typography>
        )
      )}
    </Box>
  );
}

export default function GoogleAddressPicker({
  onAddressSelect,
}: GoogleAddressPickerProps) {
  const rawApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const apiKey = normalizePublicApiKey(rawApiKey);
  const [providerError, setProviderError] = useState("");

  if (!apiKey) {
    return (
      <Alert severity="error">Thiếu NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</Alert>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      version="quarterly"
      language="vi"
      region="VN"
      authReferrerPolicy="origin"
      libraries={GOOGLE_MAPS_LIBRARIES}
      onError={(loadError) => {
        setProviderError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải Google Maps."
        );
      }}
    >
      <GoogleAddressPickerContent
        onAddressSelect={onAddressSelect}
        providerError={providerError}
      />
    </APIProvider>
  );
}
