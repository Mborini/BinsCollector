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

  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const manualPickingRef = useRef(manualPicking);

  const [selected, setSelected] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    manualPickingRef.current = manualPicking;
  }, [manualPicking]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.91, 31.95],
      zoom: 13,
    });

    mapRefExternal.current = map;

    // ✅ أزرار الزوم
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // ✅ زر الموقع (Mapbox الرسمي)
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: false, // ✅ مرة واحدة فقط (مهم)
      showUserHeading: true,
    });

    map.addControl(geolocate, "top-right");

    // ✅ تشغيله تلقائي (كأنه مكبوس)
    map.on("load", () => {
      geolocate.trigger();
    });

    /**
     * Click لاختيار موقع
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

        selectedMarkerRef.current.on("dragend", () => {
          const pos = selectedMarkerRef.current!.getLngLat();

          setSelected({
            lat: pos.lat,
            lng: pos.lng,
          });
        });
      } else {
        selectedMarkerRef.current.setLngLat([lng, lat]);
      }

      setSelected({ lat, lng });
    });

    return () => {
      map.remove();
    };
  }, []);

  /**
   * تأكيد الموقع
   */
  const handleConfirm = () => {
    if (!selected) return;
    onConfirmLocation(selected.lat, selected.lng);
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {manualPicking && selected && (
        <div
          
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 20px",
            background: "black",
            color: "#fff",
            borderRadius: 10,
            border: "none",
            fontWeight: "bold",
            zIndex: 20,
          }}
        >
المس الخريطة للتحديد        </div>
      )}
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