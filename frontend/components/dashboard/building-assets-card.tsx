// frontend/components/dashboard/building-assets-card.tsx
// Card to display the number and types of assets currently in the 'BUILT' state

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";

// Props: array of { type: string, count: number }
type BuildingAssetsCardProps = {
  buildingByType: { type: string; count: number }[];
};

export function BuildingAssetsCard({
  buildingByType,
}: BuildingAssetsCardProps) {
  // Calculate total building assets
  const total = buildingByType.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Rocket className="h-4 w-4 text-muted-foreground" />
          Building Assets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{total}</div>
        <div className="space-y-1">
          {buildingByType.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No assets currently building.
            </div>
          ) : (
            buildingByType.map((item) => (
              <div key={item.type} className="flex justify-between text-sm">
                <span>{item.type}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
