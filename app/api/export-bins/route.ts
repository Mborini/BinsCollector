import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { pool } from "@/app/src/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get("area");

  if (!areaId) {
    return NextResponse.json({ error: "area مطلوب" }, { status: 400 });
  }
  const { rows } = await pool.query(
    `
  SELECT 
    bins.id,
    bins.lat,
    bins.lng,
    bins.accuracy,
    bins.altitude,
    bins.waste_type,
    bins.bin_status,
    bins.bin_capacity,
    bins.fill_level,
    bins.street_type,
    bins.sidewalk_status,
    bins.street_width,
    bins.is_hotspot,bins.bins_Count,
    bins.notes,
    bins.image_url,
    bins.created_at,
    
    collection_areas.name AS area_name
  FROM bins
  INNER JOIN collection_areas
    ON bins.area = collection_areas.id
  WHERE bins.area = $1
ORDER BY bins.id ASC

  `,
    [areaId],
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Bins");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bins.xlsx"`,
    },
  });
}
