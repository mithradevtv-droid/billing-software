"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SalesOverview() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Revenue Overview
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex h-72 items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <p className="text-lg font-semibold">
              Revenue Chart
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Coming in Version 2
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}