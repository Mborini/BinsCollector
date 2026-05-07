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
  NumberInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useEffect, useMemo } from "react";

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
  const [form, setForm] = useState<any>({
    wasteType: "",
    binStatus: "",
    binCapacity: "",
    fillLevel: "",
    streetType: "",
    sidewalkStatus: "",
    streetWidth: "",
    isHotspot: "",
    area: "",
    binsCount: 1,
    notes: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  // ✅ تثبيت البيانات (Performance)
  const options = useMemo(
    () => ({
      waste: ["سكني", "تجاري", "صناعي", "مؤسسات حكومية", "استخدام مختلط"],
      status: ["جيدة", "تحتاج صيانة", "سيئة / تحتاج استبدال"],
      capacity: ["120 لتر", "240 لتر", "770 لتر", "1100 لتر"],
      fill: ["أكثر من 100%", "100%", "50%", "أقل من 50%"],
      street: ["اتجاهين", "اتجاه واحد"],
      sidewalk: ["يوجد رصيف", "لا يوجد رصيف"],
      width: ["< 3", "3 - 6", "6 - 10", "> 10"],
    }),
    []
  );

  // ✅ تحميل آخر اختيار
  useEffect(() => {
    const last = localStorage.getItem("last-bin-data");
    if (last) {
      setForm((prev: any) => ({
        ...prev,
        ...JSON.parse(last),
      }));
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createBin({
        lat,
        lng,
        accuracy: accuracy || null,
        altitude: altitude || null,
        ...form,
      });

      notifications.show({
        title: "تم",
        message: "تم إرسال البيانات بنجاح ✅",
        color: "green",
      });

      localStorage.setItem(
        "last-bin-data",
        JSON.stringify({
          wasteType: form.wasteType,
          streetType: form.streetType,
          sidewalkStatus: form.sidewalkStatus,
          binStatus: form.binStatus,
        })
      );

      setForm((prev: any) => ({
        ...prev,
        notes: "",
        image: null,
        binsCount: 1,
      }));

      onClose();
    } catch (error: any) {
      notifications.show({
        title: "خطأ",
        message: error?.message || "فشل الإرسال",
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
      keepMounted={false} // ✅ مهم جدًا لتقليل lag
    >
      <Stack gap="xs">

        {/* الموقع */}
        <Group grow>
          <TextInput size="xs" label="خط العرض" value={lat} readOnly />
          <TextInput size="xs" label="خط الطول" value={lng} readOnly />
        </Group>

        <Group grow>
          <TextInput size="xs" label="الارتفاع" value={altitude} readOnly />
          <TextInput size="xs" label="الدقة" value={accuracy} readOnly />
        </Group>

        {/* المنطقة */}
        <Select
          label="المنطقة"
          data={areas}
          value={form.area}
          onChange={(v) => handleChange("area", v)}
          searchable
          limit={8}
        />

        <NumberInput
          size="xs"
          label="عدد الحاويات"
          value={form.binsCount}
          onChange={(v) =>
            handleChange("binsCount", typeof v === "number" ? v : 1)
          }
          min={1}
        />

        <Title order={6}>🗑️ الحاوية</Title>

        <SegmentedControl
          value={form.wasteType}
          onChange={(v) => handleChange("wasteType", v)}
          data={options.waste}
        />

        <SegmentedControl
          value={form.binStatus}
          onChange={(v) => handleChange("binStatus", v)}
          data={options.status}
        />

        <SegmentedControl
          value={form.binCapacity}
          onChange={(v) => handleChange("binCapacity", v)}
          data={options.capacity}
        />

        <SegmentedControl
          value={form.fillLevel}
          onChange={(v) => handleChange("fillLevel", v)}
          data={options.fill}
        />

        <Title order={6}>🚧 الشارع</Title>

        <SegmentedControl
          value={form.streetType}
          onChange={(v) => handleChange("streetType", v)}
          data={options.street}
        />

        <SegmentedControl
          value={form.sidewalkStatus}
          onChange={(v) => handleChange("sidewalkStatus", v)}
          data={options.sidewalk}
        />

        <SegmentedControl
          value={form.streetWidth}
          onChange={(v) => handleChange("streetWidth", v)}
          data={options.width}
        />

        {/* hotspot */}
        <Group grow>
          <Badge
            size="lg"
            color={form.isHotspot === "نعم" ? "green" : "gray"}
            onClick={() => handleChange("isHotspot", "نعم")}
          >
            نعم
          </Badge>

          <Badge
            size="lg"
            color={form.isHotspot === "لا" ? "red" : "gray"}
            onClick={() => handleChange("isHotspot", "لا")}
          >
            لا
          </Badge>
        </Group>

        <FileInput
          size="xs"
          label="صورة"
          accept="image/*"
          value={form.image}
          onChange={(v) => handleChange("image", v)}
        />

        <Textarea
          size="xs"
          label="ملاحظات"
          value={form.notes}
          onChange={(e) =>
            handleChange("notes", e.currentTarget.value)
          }
        />

        <Button loading={loading} color="green" onClick={handleSubmit}>
          إرسال
        </Button>
      </Stack>
    </Drawer>
  );
}