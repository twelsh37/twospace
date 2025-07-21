// frontend/components/dashboard/building-assets-card.tsx
// Client-only variants (deprecated) are now in building-assets-card.client.tsx

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
// Client-only variants (deprecated) are now in building-assets-card.client.tsx

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
  // Render each badge and its number in a flex column, all in a flex row
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
        {/* Flex row: each type is a flex column with badge and number */}
        <div className="flex flex-row w-full items-end justify-between gap-2 md:gap-4">
          {types.map((type) => (
            <div
              key={type}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              <Badge
                className={`text-xs px-2 py-1 whitespace-nowrap text-center mb-1 ${TYPE_COLOR_MAP[type]}`}
              >
                {ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS] ||
                  type}
              </Badge>
              <div className="text-2xl font-bold text-center">
                {typeCountMap[type] || 0}
              </div>
            </div>
          ))}
        </div>
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
