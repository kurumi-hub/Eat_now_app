"use client";

import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useMemo, useRef } from "react";

export type OrderMapPoint = {
  lat: number;
  lon: number;
};

export type LiveMapLocation = OrderMapPoint & {
  heading?: number;
};

type LiveOrderMapProps = {
  shipper: LiveMapLocation | null;
  restaurant: OrderMapPoint | null;
  destination: OrderMapPoint | null;
  focus: "restaurant" | "destination";
};

const DEFAULT_CENTER = { lat: 10.0452, lng: 105.7469 };

function isValidPoint(point: OrderMapPoint | null): point is OrderMapPoint {
  return Boolean(
    point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lon) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lon >= -180 &&
      point.lon <= 180
  );
}

function MarkerLayer({
  shipper,
  restaurant,
  destination,
  focus,
}: LiveOrderMapProps) {
  const map = useMap();
  const shipperMarker = useRef<google.maps.Marker | null>(null);
  const restaurantMarker = useRef<google.maps.Marker | null>(null);
  const destinationMarker = useRef<google.maps.Marker | null>(null);
  const didFitBounds = useRef(false);

  useEffect(() => {
    if (!map) return;

    shipperMarker.current = new google.maps.Marker({
      map,
      title: "Vị trí tài xế",
      zIndex: 30,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#a04100",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        rotation: 0,
      },
    });
    restaurantMarker.current = new google.maps.Marker({
      map,
      title: "Nhà hàng",
      label: { text: "Q", color: "#ffffff", fontWeight: "700" },
      zIndex: 20,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#e34f2f",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });
    destinationMarker.current = new google.maps.Marker({
      map,
      title: "Điểm giao hàng",
      label: { text: "B", color: "#ffffff", fontWeight: "700" },
      zIndex: 20,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#2f76d2",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    return () => {
      shipperMarker.current?.setMap(null);
      restaurantMarker.current?.setMap(null);
      destinationMarker.current?.setMap(null);
      shipperMarker.current = null;
      restaurantMarker.current = null;
      destinationMarker.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (isValidPoint(shipper)) {
      shipperMarker.current?.setPosition({ lat: shipper.lat, lng: shipper.lon });
      shipperMarker.current?.setVisible(true);
      const icon = shipperMarker.current?.getIcon();
      if (icon && typeof icon === "object" && "path" in icon) {
        shipperMarker.current?.setIcon({
          ...icon,
          rotation: Number.isFinite(shipper.heading) ? shipper.heading : 0,
        });
      }
    } else {
      shipperMarker.current?.setVisible(false);
    }

    if (isValidPoint(restaurant)) {
      restaurantMarker.current?.setPosition({
        lat: restaurant.lat,
        lng: restaurant.lon,
      });
      restaurantMarker.current?.setVisible(true);
    } else {
      restaurantMarker.current?.setVisible(false);
    }

    if (isValidPoint(destination)) {
      destinationMarker.current?.setPosition({
        lat: destination.lat,
        lng: destination.lon,
      });
      destinationMarker.current?.setVisible(true);
    } else {
      destinationMarker.current?.setVisible(false);
    }

    const points = [shipper, restaurant, destination].filter(isValidPoint);
    if (!didFitBounds.current && points.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach((point) => bounds.extend({ lat: point.lat, lng: point.lon }));
      map.fitBounds(bounds, 56);
      didFitBounds.current = true;
      return;
    }

    if (isValidPoint(shipper)) {
      map.panTo({ lat: shipper.lat, lng: shipper.lon });
    } else {
      const target = focus === "restaurant" ? restaurant : destination;
      if (isValidPoint(target)) map.panTo({ lat: target.lat, lng: target.lon });
    }
  }, [destination, focus, map, restaurant, shipper]);

  return null;
}

function normalizeApiKey(raw: string) {
  const value = raw.trim();
  const assignment = value.match(/^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\s*=\s*(.+)$/);
  return (assignment?.[1] ?? value).trim().replace(/^['"]|['"]$/g, "");
}

export default function LiveOrderMap(props: LiveOrderMapProps) {
  const apiKey = normalizeApiKey(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
  );
  const center = useMemo(() => {
    if (isValidPoint(props.shipper)) {
      return { lat: props.shipper.lat, lng: props.shipper.lon };
    }
    const target = props.focus === "restaurant"
      ? props.restaurant
      : props.destination;
    return isValidPoint(target)
      ? { lat: target.lat, lng: target.lon }
      : DEFAULT_CENTER;
  }, [props.destination, props.focus, props.restaurant, props.shipper]);

  if (!apiKey) {
    return (
      <div className="customer-live-map__error">
        Chưa cấu hình NEXT_PUBLIC_GOOGLE_MAPS_API_KEY để hiển thị bản đồ.
      </div>
    );
  }

  return (
    <div className="customer-live-map" aria-label="Bản đồ vị trí giao hàng">
      <APIProvider
        apiKey={apiKey}
        version="quarterly"
        language="vi"
        region="VN"
        authReferrerPolicy="origin"
        solutionChannel="GMP_eatnow_order_tracking"
      >
        <Map
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          clickableIcons={false}
        >
          <MarkerLayer {...props} />
        </Map>
      </APIProvider>
      <div className="customer-live-map__legend" aria-hidden="true">
        <span><b className="is-shipper" /> Tài xế</span>
        <span><b className="is-restaurant" /> Nhà hàng</span>
        <span><b className="is-destination" /> Điểm giao</span>
      </div>
    </div>
  );
}
