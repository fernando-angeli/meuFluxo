"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-16 w-64 animate-pulse rounded-md bg-muted" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="h-[280px]">
            <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="h-[280px]">
            <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="h-[280px]">
          <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
