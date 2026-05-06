"use client";
import { IconMapPin, IconFileTypeXls, IconTruck } from "@tabler/icons-react";
import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";

const data = [
  {
    title: "تحديد مواقع الحاويات",
    description: "حدد بسهولة موقع الحاويات باستخدام خريطة مباشرة.",
    icon: IconMapPin,
  },
  {
    title: "تحميل بسهولة ",
    description: "حمل الملعلومات حسب المنطقة على شكل اكسل ",
    icon: IconFileTypeXls,
  },
  {
    title: "خدمة جمع أفضل",
    description: "بيانات ذكية تساعد في تحسين جمع النفايات وتنظيف المدينة.",
    icon: IconTruck,
  },
];

export default function Home() {
  const theme = useMantineTheme();

  return (
    <Container size="lg" py={{ base: "md", md: "xl" }}>
      {/* Header */}
      <Group justify="center">
        <Badge color="green" size="lg" radius="xl">
          نظام ذكي
        </Badge>
      </Group>

      <Title
        ta="center"
        mt="md"
        style={{
          fontSize: "clamp(20px, 4vw, 32px)",
          fontWeight: 700,
        }}
      >
        تحديد مواقع حاويات الشوارع
      </Title>

      <Text
        ta="center"
        c="dimmed"
        mt="sm"
        maw={500}
        mx="auto"
        style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
      >
        جمع معلومات الحاويات
      </Text>

      {/* Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="xl">
        {data.map((item) => (
          <Card
            key={item.title}
            radius="xl"
            p="lg"
            shadow="sm"
            style={{
              textAlign: "center",
              border: `1px solid ${theme.colors.gray[2]}`,
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
            <Group justify="center">
              <item.icon size={40} color={theme.colors.green[6]} />
            </Group>

            <Text fw={600} mt="md" size="lg">
              {item.title}
            </Text>

            <Text size="sm" c="dimmed" mt="xs">
              {item.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
``;
