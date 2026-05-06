"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Button } from "@mantine/core";
import { MapBoxView } from "../components/map/MapBoxView";
import { BinFormDrawer } from "../components/map/LocationDrawer";

export default function MapPage() {
  const mapRef = useRef<mapboxgl.Map | null>(null);

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
  value: item.name,
}));
  function handleManualSelect() {
    setOpened(false);
    setManualPicking(true);
  }

  /**
   * ✅ الجديد (بدل onMapPick)
   */
  const handleConfirmLocation = (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAccuracy(
          position.coords.accuracy ? +position.coords.accuracy.toFixed(2) : "",
        );

        setAltitude(
          position.coords.altitude !== null
            ? +position.coords.altitude.toFixed(2)
            : "",
        );
      },
      () => {
        setAccuracy("");
        setAltitude("");
      },
    );

    setManualPicking(false);

    setTimeout(() => {
      setOpened(true);
    }, 200);
  };

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
        onConfirmLocation={handleConfirmLocation} // ✅ المهم
      />

      {!manualPicking && (
        <Button
          onClick={handleManualSelect}
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          اضافة موقع حاوية{" "}
        </Button>
      )}

     <BinFormDrawer
  opened={opened}
  onClose={() => setOpened(false)}
  lat={lat}
  lng={lng}
  accuracy={accuracy}
  altitude={altitude}
  areas={areas} // ✅ هون
/>
    </div>
  );
}
