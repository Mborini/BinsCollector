"use client";

import "@mantine/core/styles.css";
import {
  MantineProvider,
  AppShell,
  AppShellNavbar,
  AppShellHeader,
  Burger,
  Stack,
  UnstyledButton,
  Tooltip,
  Group,
  Title,
  Card,
  Text,
} from "@mantine/core";
import {
  IconHome2,
  IconGauge,
  IconDeviceDesktopAnalytics,
  IconSettings,
  IconMap,
} from "@tabler/icons-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainLinks = [
  { icon: IconHome2, label: "Home", href: "/" },
  { icon: IconGauge, label: "Dashboard", href: "/dashboard" },
  { icon: IconDeviceDesktopAnalytics, label: "Collection Areas", href: "/collection-areas/manage" },
  { icon: IconMap, label: "Map", href: "/map" },
  { icon: IconSettings, label: "Settings", href: "/settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const current =
    mainLinks.find((l) => isActive(l.href)) ?? mainLinks[0];

  return (
    <html lang="ar" dir="ltr">
      <body style={{ height: "100vh", margin: 0 }}>
        <MantineProvider>
          <AppShell
            padding={0}
            navbar={{
              width: { base: 280, sm: 80 }, // 📱 موبايل | 🖥 ديسكتوب
              breakpoint: "sm",
              collapsed: { mobile: !opened },
            }}
            header={{ height: 56 }}
            styles={{
              main: {
                height: "100%",
                overflow: "hidden",
              },
            }}
          >
            {/* HEADER */}
            <AppShellHeader>
              <Group h="100%" px="md">
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Title order={5}>{current.label}</Title>
              </Group>
            </AppShellHeader>

            {/* SIDEBAR */}
            <AppShellNavbar p="md">
              {/* 🖥 Desktop: Icons */}
              <Stack gap="sm" align="center" visibleFrom="sm">
                {mainLinks.map((link) => (
                  <Tooltip key={link.label} label={link.label} position="left">
                    <UnstyledButton
                      component={Link}
                      href={link.href}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isActive(link.href)
                          ? "var(--mantine-color-blue-light)"
                          : "transparent",
                      }}
                    >
                      <link.icon size={22} />
                    </UnstyledButton>
                  </Tooltip>
                ))}
              </Stack>

              {/* 📱 Mobile: Cards */}
              <Stack gap="sm" hiddenFrom="sm">
                {mainLinks.map((link) => (
                  <Card
                    key={link.label}
                    component={Link}
                    href={link.href}
                    withBorder
                    radius="md"
                    p="md"
                    onClick={() => setOpened(false)}
                    style={{
                      cursor: "pointer",
                      background: isActive(link.href)
                        ? "var(--mantine-color-blue-light)"
                        : undefined,
                    }}
                  >
                    <Group>
                      <link.icon size={20} />
                      <Text fw={500}>{link.label}</Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </AppShellNavbar>

            {/* MAIN CONTENT */}
            <AppShell.Main>
              {children}
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}