
import { pool } from "@/app/src/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name } = await req.json();

  const { rows } = await pool.query(
    `UPDATE collection_areas
     SET name = $1
     WHERE id = $2
     RETURNING id, name, created_at`,
    [name, params.id]
  );

  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await pool.query(
    `UPDATE collection_areas
     SET is_deleted = true
     WHERE id = $1`,
    [params.id]
  );

  return NextResponse.json({ success: true });
}