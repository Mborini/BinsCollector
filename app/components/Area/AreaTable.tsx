"use client";

import {
  Table,
  Group,
  Text,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

type Row = {
  id: number;
  name: string;
  created_at: string;
};

interface Props {
  data: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: number) => void;
}

export function CollectionTable({ data, onEdit, onDelete }: Props) {
  return (
    <Box maw={750} mx="auto">
      <Table
        highlightOnHover
        verticalSpacing="xs"
        horizontalSpacing="sm"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th >Created</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data.map((row) => (
            <Table.Tr key={row.id}>
              <Table.Td>
                <Text size="xs" c="dimmed">
                  {row.id}
                </Text>
              </Table.Td>

              <Table.Td>{row.name}</Table.Td>

              <Table.Td>
                <Text size="sm" c="dimmed">
                  {new Date(row.created_at).toLocaleDateString()}
                </Text>
              </Table.Td>

              <Table.Td>
                <Group gap={4} justify="flex-end">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => onEdit(row)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>

                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => onDelete(row.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}