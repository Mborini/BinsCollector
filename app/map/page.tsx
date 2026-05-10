"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { MapBoxView } from "../components/map/MapBoxView";
import { BinFormDrawer } from "../components/map/LocationDrawer";
import { IconTrash, IconTrashOff } from "@tabler/icons-react";

export default function MapPage() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const binsMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const [bins, setBins] = useState<any[]>([]);
  const [showingBins, setShowingBins] = useState(false);

  const [lat, setLat] = useState(31.95);
  const [lng, setLng] = useState(35.91);
  const [opened, setOpened] = useState(false);
  const [manualPicking, setManualPicking] = useState(false);

  const [accuracy, setAccuracy] = useState<number | "">("");
  const [altitude, setAltitude] = useState<number | "">("");

  const [data, setData] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/collection-areas");
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const areas = data.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  function handleManualSelect() {
    setOpened(false);
    setManualPicking(true);
  }

  // ✅ رسم كل الحاويات من state
  const showBins = () => {
    if (!mapRef.current) return;

    binsMarkersRef.current.forEach((m) => m.remove());
    binsMarkersRef.current = [];

    bins.forEach((bin: any) => {
      const lat = parseFloat(bin.lat);
      const lng = parseFloat(bin.lng);

      if (isNaN(lat) || isNaN(lng)) return;

   const el = document.createElement("div");
el.style.display = "flex";
el.style.flexDirection = "column";
el.style.alignItems = "center";

// صورة الحاوية
const img = document.createElement("img");
img.src = "/recycling-bin.png";
img.style.width = "35px";
img.style.height = "35px";

const label = document.createElement("span");

label.innerHTML = `
  ${bin.bin_capacity ?? ""} 
  <span style="color: red;">
    (id:${bin.id ?? ""})
  </span>
`;

label.style.fontSize = "12px";
label.style.color = "#000";
label.style.whiteSpace = "nowrap";
// إضافة العناصر
el.appendChild(img);
el.appendChild(label);
      const marker = new mapboxgl.Marker(el, {
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      binsMarkersRef.current.push(marker);
    });
  };

  // ✅ إخفاء
  const hideBins = () => {
    binsMarkersRef.current.forEach((m) => m.remove());
    binsMarkersRef.current = [];
  };

  // ✅ إضافة marker واحد بعد الحفظ
  const addSingleMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    const el = document.createElement("img");
    el.src = "/recycling-bin.png";
    el.style.width = "35px";
    el.style.height = "35px";

    const marker = new mapboxgl.Marker(el, {
      anchor: "bottom",
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current!);

    binsMarkersRef.current.push(marker);
  };

  // ✅ تأكيد الموقع
  const handleConfirmLocation = (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);

    setManualPicking(false);

    setTimeout(() => {
      setOpened(true);
    }, 200);
  };

  // ✅ تحميل البيانات أول مرة
  useEffect(() => {
    const loadBins = async () => {
      const res = await fetch("/api/bins");
      const data = await res.json();

      setBins(data);
      setShowingBins(true); // ✅ عرض تلقائي
    };

    loadBins();
  }, []);

  // ✅ رسم تلقائي
  useEffect(() => {
    if (bins.length > 0 && showingBins) {
      showBins();
    }
  }, [bins]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 56px)",
      }}
    >
      <MapBoxView
        mapRefExternal={mapRef}
        manualPicking={manualPicking}
        onConfirmLocation={handleConfirmLocation}
      />

      {!manualPicking && (
        <Button
          size="lg"
          radius="xl"
          color="blue"
          onClick={handleManualSelect}
          style={{
            position: "absolute",
            bottom: 45,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          📍 حدد موقع
        </Button>
      )}

      <BinFormDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        lat={lat}
        lng={lng}
        accuracy={accuracy}
        altitude={altitude}
        areas={areas}
        onCreated={addSingleMarker} // ✅ مهم
      />

      {/* ✅ زر toggle */}
      <Tooltip
        label={showingBins ? "إخفاء الحاويات" : "عرض الحاويات"}
        position="left"
      >
        <ActionIcon
          size={35}
          variant="light"
          color={showingBins ? "red" : "blue"}
          onClick={() => {
            if (showingBins) {
              hideBins();
              setShowingBins(false);
            } else {
              showBins();
              setShowingBins(true);
            }
          }}
          style={{
            position: "absolute",
            top: 155,
            right: 10,
            zIndex: 20,
          }}
        >
          {showingBins ? <IconTrashOff /> : <IconTrash />}
        </ActionIcon>
      </Tooltip>
    </div>
  );
}