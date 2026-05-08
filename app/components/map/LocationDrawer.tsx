"use client";

import { createBin } from "@/app/services/binService";
import {
  Drawer,
  Button,
  Stack,
  TextInput,
  Select,
  Group,
  FileInput,
  Textarea,
  Title,
  SegmentedControl,
  Badge,
  Input,
  NumberInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";

interface Props {
  opened: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  accuracy: number | "";
  altitude: number | "";
  areas: { label: string; value: string }[];
}

export function BinFormDrawer({
  opened,
  onClose,
  lat,
  lng,
  accuracy,
  altitude,
  areas,
}: Props) {
  const [wasteType, setWasteType] = useState<string | null>(null);
  const [binStatus, setBinStatus] = useState<string | null>(null);
  const [binCapacity, setBinCapacity] = useState<string | null>(null);
  const [fillLevel, setFillLevel] = useState<string | null>(null);
  const [streetType, setStreetType] = useState<string | null>(null);
  const [sidewalkStatus, setSidewalkStatus] = useState<string | null>(null);
  const [streetWidth, setStreetWidth] = useState<string | null>(null);
  const [isHotspot, setIsHotspot] = useState<string | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState<string | null>(null);
  const [binsCount, setBinsCount] = useState<number>(1);

  // ✅ تحميل آخر اختيار (توفير وقت)
  useEffect(() => {
    const last = localStorage.getItem("last-bin-data");
    if (last) {
      const data = JSON.parse(last);
      setWasteType(data.wasteType || null);
      setStreetType(data.streetType || null);
      setSidewalkStatus(data.sidewalkStatus || null);
      setBinStatus(data.binStatus || null);
    }
  }, []);

  const resetForm = () => {
    setWasteType(null);
    setBinStatus(null);
    setBinCapacity(null);
    setFillLevel(null);
    setStreetType(null);
    setSidewalkStatus(null);
    setStreetWidth(null);
    setIsHotspot(null);
    setArea(null);
    setImage(null);
    setNotes("");
    setBinsCount(1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createBin({
        lat,
        lng,
        accuracy: accuracy === "" ? null : accuracy,
        altitude: altitude === "" ? null : altitude,

        wasteType: wasteType || undefined,
        binStatus: binStatus || undefined,
        binCapacity: binCapacity || undefined,
        fillLevel: fillLevel || undefined,
        streetType: streetType || undefined,
        sidewalkStatus: sidewalkStatus || undefined,
        streetWidth: streetWidth || undefined,
        isHotspot: isHotspot || undefined,
        binsCount: binsCount || 1,
        area: area || undefined,
        notes,
        image,
      });

      notifications.show({
        title: "تم",
        message: "تم إرسال البيانات بنجاح ✅",
        color: "green",
      });

      // ✅ حفظ آخر إدخال
      localStorage.setItem(
        "last-bin-data",
        JSON.stringify({
          wasteType,
          streetType,
          sidewalkStatus,
          binStatus,
        }),
      );

      resetForm();
      onClose();
    } catch (error) {
      notifications.show({
        title: "خطأ",
        message:
          error instanceof Error ? error.message : "حدث خطأ أثناء الإرسال",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      dir="rtl"
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="70%"
      title="نموذج بيانات الحاوية"
      overlayProps={{ opacity: 0.55, blur: 2 }}
    >
      <Stack gap="xs">
        <Group grow>
          <TextInput size="xs" label="خط العرض" value={lat} readOnly />
          <TextInput size="xs" label="خط الطول" value={lng} readOnly />
        </Group>
        <Group grow>
          <TextInput
            size="xs"
            label="الارتفاع (متر)"
            value={altitude}
            readOnly
          />
          <TextInput size="xs" label="الدقة (متر)" value={accuracy} readOnly />
        </Group>
        {/* ✅ محسن - أسرع فتح */}
        <Title order={6}>المنطقة</Title>
        <SegmentedControl
          size="xs"
          value={area || ""}
          onChange={setArea}
          data={areas}
        />

        <NumberInput
          size="xs"
          label="عدد الحاويات"
          value={binsCount}
          onChange={(value) => {
            if (typeof value === "number") {
              setBinsCount(value);
            } else {
              setBinsCount(1);
            }
          }}
          min={1}
          max={100}
          step={1}
          clampBehavior="strict"
        />

        <Title order={6}>🗑️ بيانات الحاوية</Title>

        <SegmentedControl
          value={wasteType || ""}
          onChange={setWasteType}
          data={["سكني", "تجاري", "صناعي", "مؤسسات حكومية", "استخدام مختلط"]}
        />

        <SegmentedControl
        
          value={binStatus || ""}
          onChange={setBinStatus}
          data={["جيدة", "تحتاج صيانة", "سيئة / تحتاج استبدال"]}
        />

        <SegmentedControl
          value={binCapacity || ""}
          onChange={setBinCapacity}
          data={["120 لتر", "240 لتر", "770 لتر", "1100 لتر"]}
        />

        <SegmentedControl
          value={fillLevel || ""}
          onChange={setFillLevel}
          data={["أكثر من 100%", "100%", "50%", "أقل من 50%"]}
        />

        <Title order={6}>🚧 الشارع</Title>

        <SegmentedControl
          value={streetType || ""}
          onChange={setStreetType}
          data={["اتجاهين", "اتجاه واحد"]}
        />

        <SegmentedControl
          value={sidewalkStatus || ""}
          onChange={setSidewalkStatus}
          data={["يوجد رصيف", "لا يوجد رصيف"]}
        />

        <SegmentedControl
          value={streetWidth || ""}
          onChange={setStreetWidth}
          data={["< 3", "3 - 6", "6 - 10", "> 10"]}
        />

        {/* ✅ أسرع yes/no */}
        <Title order={6}>🔥 نقطة ساخنة؟</Title>
        <Group grow>
          <Badge
            size="lg"
            color={isHotspot === "نعم" ? "green" : "blue"}
            variant={isHotspot === "نعم" ? "light" : "outline"}
            onClick={() => setIsHotspot("نعم")}
          >
            نعم
          </Badge>

          <Badge
            size="lg"
            color={isHotspot === "لا" ? "red" : "blue"}
            variant={isHotspot === "لا" ? "light" : "outline"}
            onClick={() => setIsHotspot("لا")}
          >
            لا
          </Badge>
        </Group>

        <FileInput
          size="xs"
          label="إرفاق صورة"
          accept="image/*"
          value={image}
          onChange={setImage}
          clearable
        />

        <Textarea
          size="xs"
          label="ملاحظات"
          minRows={2}
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
        />

        <Button
          color="green"
          size="xs"
          onClick={handleSubmit}
          loading={loading}
        >
          إرسال
        </Button>
      </Stack>
    </Drawer>
  );
}
