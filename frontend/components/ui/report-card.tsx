// filepath: frontend/components/ui/report-card.tsx
// ReportCard component: Use for all report pages to ensure consistent, professional layout.
// Props: title (string), date (string), children (content: chart/table), className (optional)
// Usage: <ReportCard title="..." date="...">...</ReportCard>

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";

interface ReportCardProps {
  title: string;
  date: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ReportCard: Use for all report pages to group heading, date, chart, and data in a single card.
 * Ensures consistent spacing, mobile-friendly layout, and professional appearance.
 */
export function ReportCard({
  title,
  date,
  children,
  footer,
  className,
}: ReportCardProps) {
  return (
    <Card
      className={`w-full max-w-md mx-auto my-6 shadow-lg ${
        className || ""
      }`.trim()}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-center">{title}</CardTitle>
        <div className="text-xs text-muted-foreground text-center">
          Prepared on: {date}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center px-2 py-4">
        {children}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
