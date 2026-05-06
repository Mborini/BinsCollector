"use client";

import { AreaDrawer } from "@/app/components/Area/AreaDrawer";
import { CollectionTable } from "@/app/components/Area/AreaTable";
import {
  Button,
  Group,
  Stack,
  Title,
  Paper,
  Container,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function ManageAreas() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);

  async function load() {
    const res = await fetch("/api/collection-areas");
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function save(payload: { name: string }) {
    await fetch(
      edit
        ? `/api/collection-areas/${edit.id}`
        : "/api/collection-areas",
      {
        method: edit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      }
    );

    setOpen(false);
    setEdit(null);
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/collection-areas/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <Container mt={25} size="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={3}>Collection Areas</Title>

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setOpen(true)}
          >
            Add Area
          </Button>
        </Group>

        {/* Table */}
        <Paper withBorder radius="md" p="md">
          <CollectionTable
            data={data}
            onEdit={(row) => {
              setEdit(row);
              setOpen(true);
            }}
            onDelete={remove}
          />
        </Paper>
      </Stack>

      {/* Drawer */}
      <AreaDrawer
        open={open}
        initial={edit}
        onClose={() => {
          setOpen(false);
          setEdit(null);
        }}
        onSave={save}
      />
    </Container>
  );
}