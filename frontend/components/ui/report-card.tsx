// frontend/components/ui/report-card.tsx

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
