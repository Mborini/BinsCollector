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
} from "@mantine/core";
import { useState } from "react";

interface Props {
  opened: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  accuracy: number | "";
  altitude: number | "";
  areas: { label: string; value: string }[]; // ✅ مهم
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
  const resetForm = () => {
    setWasteType(null);
    setBinStatus(null);
    setBinCapacity(null);
    setFillLevel(null);
    setStreetType(null);
    setSidewalkStatus(null);
    setStreetWidth(null);
    setIsHotspot(null);
    setImage(null);
    setNotes("");
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

        area: area || undefined,
        notes,
        image,
      });

      alert("تم إرسال البيانات بنجاح");
      resetForm();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "حدث خطأ أثناء الإرسال");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      lat,
      lng,
      accuracy,
      altitude,
      wasteType,
      binStatus,
      binCapacity,
      fillLevel,
      streetType,
      sidewalkStatus,
      streetWidth,
      isHotspot,
      notes,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("bin-form-draft", JSON.stringify(draft));
  };

  return (
    <Drawer
      dir="rtl"
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="85%"
      title="نموذج بيانات الحاوية"
      styles={{
        content: { direction: "rtl" },
        header: { direction: "rtl" },
        title: { fontWeight: 700 },
      }}
      overlayProps={{ opacity: 0.55, blur: 2 }}
    >
      <Stack gap="sm">
        <Title order={6}>موقع الحاوية</Title>

        <Group grow>
          <TextInput size="sm" label="خط العرض" value={lat} readOnly />
          <TextInput size="sm" label="خط الطول" value={lng} readOnly />
        </Group>

        <TextInput size="sm" label="الارتفاع (متر)" value={altitude} readOnly />

        <TextInput size="sm" label="الدقة (متر)" value={accuracy} readOnly />
        <Select
        required
          dir="rtl"
          size="sm"
          label="المنطقة"
          value={area}
          onChange={setArea}
          data={areas}
          searchable
          nothingFoundMessage="لا يوجد نتائج"
          clearable
        />

        <Select required
          size="sm"
          label="نوع النفايات"
          value={wasteType}
          onChange={setWasteType}
          data={["سكني", "تجاري", "صناعي", "مؤسسات حكومية", "استخدام مختلط"]}
          clearable
        />

        <Select required
          size="sm"
          label="حالة الحاوية"
          value={binStatus}
          onChange={setBinStatus}
          data={["جيدة", "تحتاج صيانة", "سيئة / تحتاج استبدال"]}
          clearable
        />

        <Select required
          size="sm"
          label="سعة الحاوية"
          value={binCapacity}
          onChange={setBinCapacity}
          data={["120 لتر", "240 لتر", "770 لتر", "1100 لتر"]}
          clearable
        />

        <Select required
          size="sm"
          label="نسبة الامتلاء"
          value={fillLevel}
          onChange={setFillLevel}
          data={["أكثر من 100%", "100%", "50%", "أقل من 50%"]}
          clearable
        />

        <Select required
          size="sm"
          label="نوع الشارع"
          value={streetType}
          onChange={setStreetType}
          data={["اتجاهين", "اتجاه واحد"]}
          clearable
        />

        <Select required
          size="sm"
          label="حالة الرصيف"
          value={sidewalkStatus}
          onChange={setSidewalkStatus}
          data={["يوجد رصيف", "لا يوجد رصيف"]}
          clearable
        />

        <Select
        required
          size="sm"
          label="عرض الشارع (متر)"
          value={streetWidth}
          onChange={setStreetWidth}
          data={["< 3", "3 - 6", "6 - 10", "> 10"]}
          clearable
        />

        <Select
        required
          size="sm"
          label="نقطة نفايات ساخنة؟"
          value={isHotspot}
          onChange={setIsHotspot}
          data={["نعم", "لا"]}
          clearable
        />

        <FileInput
          size="sm"
          label="إرفاق صورة"
          accept="image/*"
          value={image}
          onChange={setImage}
          clearable
        />

        <Textarea
          size="sm"
          label="ملاحظات"
          minRows={2}
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
        />

        <Group grow>
         

          <Button color="green" size="sm" onClick={handleSubmit} loading={loading}>
            إرسال
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
