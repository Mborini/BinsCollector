"use client";

import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  mapRefExternal: MutableRefObject<mapboxgl.Map | null>;
  manualPicking: boolean;
  onConfirmLocation: (lat: number, lng: number) => void;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function MapBoxView({
  mapRefExternal,
  manualPicking,
  onConfirmLocation,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const gpsMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const accuracyCircleRef = useRef<string>("accuracy-circle");

  const watchRef = useRef<number | null>(null);
  const manualPickingRef = useRef(manualPicking);

  const [selected, setSelected] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    manualPickingRef.current = manualPicking;
  }, [manualPicking]);

  /**
   * إنشاء الخريطة
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.91, 31.95],
      zoom: 13,
    });

    mapRefExternal.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    /**
     * GPS marker
     */
    gpsMarkerRef.current = new mapboxgl.Marker({ color: "green" })
      .setLngLat([35.91, 31.95])
      .addTo(map);

    /**
     * GPS Tracking
     */
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(6);
        const lng = +pos.coords.longitude.toFixed(6);

        setAccuracy(pos.coords.accuracy || 0);

        gpsMarkerRef.current?.setLngLat([lng, lat]);

        if (!manualPickingRef.current) {
          map.easeTo({ center: [lng, lat], zoom: 16 });
        }
      },
      console.error,
      { enableHighAccuracy: true },
    );

    /**
     * Click = create marker
     */
    map.on("click", (e) => {
      if (!manualPickingRef.current) return;

      const lat = +e.lngLat.lat.toFixed(6);
      const lng = +e.lngLat.lng.toFixed(6);

      if (!selectedMarkerRef.current) {
        selectedMarkerRef.current = new mapboxgl.Marker({
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map);

        /**
         * 🟢 DRAG
         */
        selectedMarkerRef.current.on("dragend", () => {
          const pos = selectedMarkerRef.current!.getLngLat();

          setSelected({
            lat: pos.lat,
            lng: pos.lng,
          });

          updateAccuracyCircle(map, pos.lng, pos.lat);
        });
      } else {
        selectedMarkerRef.current.setLngLat([lng, lat]);
      }

      setSelected({ lat, lng });

      updateAccuracyCircle(map, lng, lat);
    });

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);

      map.remove();
    };
  }, []);

  /**
   * 🔵 رسم دائرة الدقة
   */
  const updateAccuracyCircle = (
    map: mapboxgl.Map,
    lng: number,
    lat: number,
  ) => {
    const radius = accuracy;

    const circleGeoJSON = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {},
    };

    if (map.getSource("accuracy")) {
      (map.getSource("accuracy") as any).setData(circleGeoJSON);
    } else {
      map.addSource("accuracy", {
        type: "geojson",
        data: circleGeoJSON,
      });

      map.addLayer({
        id: "accuracy-circle",
        type: "circle",
        source: "accuracy",
        paint: {
          "circle-radius": radius,
          "circle-color": "#3b82f6",
          "circle-opacity": 0.2,
        },
      });
    }
  };

  /**
   * 📍 CONFIRM
   */
  const handleConfirm = () => {
    if (!selected) return;

    onConfirmLocation(selected.lat, selected.lng);
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div ref={containerRef} style={{ height: "100%" }} />

      {manualPicking && selected && (
        <button
          onClick={handleConfirm}
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 20px",
            background: "#2f9e44",
            color: "#fff",
            borderRadius: 10,
            border: "none",
            fontWeight: "bold",
            zIndex: 20,
          }}
        >
          تأكيد الموقع
        </button>
      )}
    </div>
  );
}
