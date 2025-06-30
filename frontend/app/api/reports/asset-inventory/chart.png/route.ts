// frontend/app/api/reports/asset-inventory/chart.png/route.ts
// API route to generate and cache a PNG chart of asset inventory by type

import { NextRequest, NextResponse } from "next/server";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { db, assetsTable } from "@/lib/db";
import { settingsTable } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";

// In-memory cache for the PNG chart
let cachedPng: Buffer | null = null;
let cachedAt: number = 0;
let cachedDuration: number = 30 * 60 * 1000; // 30 min default

// Helper to get cache duration from settings
async function getCacheDuration(): Promise<number> {
  try {
    const settings = await db.select().from(settingsTable).limit(1);
    if (settings.length && settings[0].reportCacheDuration) {
      return settings[0].reportCacheDuration * 60 * 1000;
    }
  } catch {}
  return 30 * 60 * 1000;
}

// Helper to get asset counts by type
async function getAssetCountsByType() {
  const assets = await db
    .select()
    .from(assetsTable)
    .where(isNull(assetsTable.deletedAt));
  const counts: Record<string, number> = {};
  for (const asset of assets) {
    counts[asset.type as string] = (counts[asset.type as string] || 0) + 1;
  }
  return counts;
}

// Chart rendering config
const width = 900;
const height = 450;
const chartCallback = (ChartJS: any) => {
  // Optionally register plugins or set defaults here
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  chartCallback,
});

export async function GET(_req: NextRequest) {
  const now = Date.now();
  const cacheDuration = await getCacheDuration();
  if (cachedPng && now - cachedAt < cacheDuration) {
    return new NextResponse(cachedPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": `public, max-age=${Math.floor(cacheDuration / 1000)}`,
      },
    });
  }
  // Fetch data
  const counts = await getAssetCountsByType();
  const labels = Object.keys(counts).sort();
  const data = labels.map((type) => counts[type]);
  const backgroundColors = labels.map((type) => {
    switch (type) {
      case "LAPTOP":
        return "#3B82F6";
      case "MONITOR":
        return "#22C55E";
      case "MOBILE_PHONE":
        return "#A21CAF";
      case "DESKTOP":
        return "#F59E42";
      case "TABLET":
        return "#EC4899";
      default:
        return "#6B7280";
    }
  });
  // Chart.js config
  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: { title: { display: false } },
        y: { beginAtZero: true },
      },
    },
  };
  // Render chart to PNG
  const png = await chartJSNodeCanvas.renderToBuffer(config);
  cachedPng = png;
  cachedAt = now;
  cachedDuration = cacheDuration;
  return new NextResponse(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${Math.floor(cacheDuration / 1000)}`,
    },
  });
}
