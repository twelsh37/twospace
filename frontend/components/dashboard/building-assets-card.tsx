// frontend/components/dashboard/building-assets-card.tsx
// Card to display the number and types of assets currently in the 'BUILDING' state

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABELS } from "@/lib/constants";

const TYPE_COLOR_MAP: Record<string, string> = {
  DESKTOP: "bg-orange-500 text-white",
  LAPTOP: "bg-blue-500 text-white",
  MONITOR: "bg-green-500 text-white",
  MOBILE_PHONE: "bg-purple-500 text-white",
  TABLET: "bg-pink-500 text-white",
};

const DEVICE_TYPE_ORDER = [
  "DESKTOP",
  "LAPTOP",
  "MONITOR",
  "MOBILE_PHONE",
  "TABLET",
];

const SINGULAR_TO_PLURAL: Record<string, string> = {
  Desktop: "Desktops",
  Laptop: "Laptops",
  Monitor: "Monitors",
  "Mobile Phone": "Mobile Phones",
  Tablet: "Tablets",
};

function normalizeType(type: string): string {
  return SINGULAR_TO_PLURAL[type] || type;
}

function getTypeCountMap(data: { type: string; count: number }[]) {
  const map: Record<string, number> = {};
  for (const item of data) {
    const normalizedType = normalizeType(item.type);
    map[normalizedType] = item.count;
  }
  return map;
}

export function BuildingAssetsCard({
  buildingByType,
}: {
  buildingByType: { type: string; count: number }[];
}) {
  const typeCountMap = getTypeCountMap(buildingByType);
  // Render badges in a single row, and counts in a row below, both aligned by type
  const types = ["DESKTOP", "LAPTOP", "MOBILE_PHONE", "TABLET"];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2" />
          Building Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {/* Row of badges for each device type */}
        <div className="flex flex-row w-full items-center justify-between gap-2 md:gap-4 mb-1">
          {types.map((type) => (
            <Badge
              key={type}
              className={`text-xs px-2 py-1 whitespace-nowrap text-center ${TYPE_COLOR_MAP[type]}`}
            >
              {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS] ||
                type}
            </Badge>
          ))}
        </div>
        {/* Row of counts for each device type, aligned with badges above */}
        <div className="flex flex-row w-full items-center justify-between gap-2 md:gap-4">
          {types.map((type) => (
            <div key={type} className="text-2xl font-bold text-center flex-1">
              {typeCountMap[type] || 0}
            </div>
          ))}
        </div>
        {/*
          Reasoning: The badges are now in a single row, and the counts are in a row below, both using flex for alignment.
          This matches the desired visual layout and avoids a grid/column structure.
        */}
      </CardContent>
    </Card>
  );
}

export function ReadyToGoAssetsCard({
  readyToGoByType,
}: {
  readyToGoByType: { type: string; count: number }[];
}) {
  const typeCountMap = getTypeCountMap(readyToGoByType);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Rocket className="h-4 w-4 text-green-500" />
          Ready To Go Devices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-nowrap w-full items-end justify-between gap-2 md:gap-4">
          {DEVICE_TYPE_ORDER.map((type) => (
            <div
              key={type}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              <Badge
                className={`mb-1 text-xs px-2 py-1 whitespace-nowrap text-center ${TYPE_COLOR_MAP[type]}`}
              >
                {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS] ||
                  type}
              </Badge>
              <div className="text-2xl font-bold">
                {typeCountMap[type] || 0}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
