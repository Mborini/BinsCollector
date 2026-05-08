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

    // ✅ منع خطأ SSR + تشغيل RTL فقط في المتصفح
    if (typeof window !== "undefined") {
      try {
        // @ts-ignore
        if (
          !mapboxgl.getRTLTextPluginStatus ||
          mapboxgl.getRTLTextPluginStatus() !== "loaded"
        ) {
          // @ts-ignore
          mapboxgl.setRTLTextPlugin(
            "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
            null,
            true
          );
        }
      } catch (e) {
        console.warn("RTL plugin error:", e);
      }
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.91, 31.95],
      zoom: 13,
    });

    mapRefExternal.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });

    map.addControl(geolocate, "top-right");

    let firstFix = true;

    const originalJumpTo = map.jumpTo.bind(map);

    geolocate.on("geolocate", (e) => {
      const lat = e.coords.latitude;
      const lng = e.coords.longitude;

      if (firstFix) {
        originalJumpTo({
          center: [lng, lat],
          zoom: 15,
        });
        firstFix = false;

        lockCamera();
      }
    });

    function lockCamera() {
      map.on("movestart", (e) => {
        if (!e.originalEvent) {
          map.stop();
        }
      });

      const noop = () => {};

      map.easeTo = noop as any;
      map.flyTo = noop as any;
      map.jumpTo = noop as any;
    }

    map.on("load", () => {
      // ✅ تحويل جميع أسماء الأماكن إلى عربي
      const layers = map.getStyle().layers;

      if (layers) {
        layers.forEach((layer) => {
          if (
            layer.type === "symbol" &&
            layer.layout &&
            layer.layout["text-field"]
          ) {
            map.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name_ar"], // عربي
              ["get", "name"], // fallback
            ]);
          }
        });
      }

      geolocate.trigger();
    });

    geolocate.on("trackuserlocationend", () => {
      setTimeout(() => {
        geolocate.trigger();
      }, 500);
    });

    map.on("click", (e) => {
      if (!manualPickingRef.current) return;

      const lat = +e.lngLat.lat.toFixed(6);
      const lng = +e.lngLat.lng.toFixed(6);

      if (!selectedMarkerRef.current) {
        selectedMarkerRef.current = new mapboxgl.Marker({
          draggable: true,
          color: "#e03131",
        })
          .setLngLat([lng, lat])
          .addTo(map);

        selectedMarkerRef.current.on("dragend", () => {
          const pos = selectedMarkerRef.current!.getLngLat();

          setSelected({
            lat: +pos.lat.toFixed(6),
            lng: +pos.lng.toFixed(6),
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

  const handleConfirm = () => {
    if (!selected) return;
    onConfirmLocation(selected.lat, selected.lng);
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {manualPicking && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 18px",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            borderRadius: 14,
            zIndex: 20,
            fontSize: 14,
          }}
        >
          👆 اضغط على الخريطة لتحديد الموقع
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          height: "100%",
          cursor: manualPicking ? "crosshair" : "grab",
        }}
      />

      {manualPicking && selected && (
        <button
          onClick={handleConfirm}
          style={{
            position: "absolute",
            bottom: 25,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 28px",
            background: "#2f9e44",
            color: "#fff",
            borderRadius: 30,
            border: "none",
            fontWeight: "bold",
            fontSize: 16,
            zIndex: 20,
            cursor: "pointer",
          }}
        >
          تأكيد الموقع
        </button>
      )}
    </div>
  );
}