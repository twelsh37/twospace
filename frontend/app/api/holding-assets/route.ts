// frontend/app/api/holding-assets/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { holdingAssetsTable } from "@/lib/db/schema";

export async function GET() {
  try {
    const assets = await db.select().from(holdingAssetsTable);
    return NextResponse.json({ data: { assets } });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch holding assets." },
      { status: 500 }
    );
  }
}
