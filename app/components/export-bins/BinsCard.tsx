"use client";

import { Card, Text, Button, Stack, Group } from "@mantine/core";
import { IconMapPin, IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import { useMantineTheme } from "@mantine/core";

interface Props {
  zone: {
    id: number;
    name: string;
  };
}

export default function BinsCard({ zone }: Props) {
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();

  const handleDownload = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/export-bins?area=${zone.id}`);

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const now = new Date();
      const formatted = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;

      a.download = `bins-${zone.id}-${formatted}.xlsx`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("❌ فشل تحميل الملف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      radius="xl"
      shadow="sm"
      p="lg"
      style={{
        border: `1px solid ${theme.colors.gray[2]}`,
        textAlign: "center",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = theme.shadows.sm;
      }}
    >
      <Stack gap="sm">
        <Group justify="center">
          <IconMapPin size={36} color={theme.colors.green[6]} />
        </Group>

        <Text fw={700} size="lg">
          {zone.name}
        </Text>

        <Text size="sm" c="dimmed">
          تحميل بيانات الحاويات الخاصة بالمنطقة
        </Text>

        <Button
          leftSection={<IconDownload size={16} />}
          loading={loading}
          radius="xl"
          variant="light"
          color="green"
          onClick={handleDownload}
          fullWidth
        >
          تحميل Excel
        </Button>
      </Stack>
    </Card>
  );
}
``