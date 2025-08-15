import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Specific skeleton for TaskDetailPage that matches the actual layout
export const TaskDetailSkeleton = () => {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      {/* Dashboard Grid - Desktop XL Layout */}
      <div className="p-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Desktop layout */}
          <div className="hidden 2xl:grid 2xl:grid-cols-6 gap-6 min-h-[600px]">
            {/* Task Details Card */}
            <div className="col-span-2 row-span-2">
              <Card className="h-full min-h-[280px]">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pomodoro Card */}
            <div className="col-span-2 row-span-2">
              <Card className="h-full min-h-[280px]">
                <CardHeader>
                  <Skeleton className="h-6 w-28" />
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </CardContent>
              </Card>
            </div>

            {/* Subtasks Card */}
            <div className="col-span-2 row-span-4">
              <Card className="h-full min-h-[580px]">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Notes Card */}
            <div className="col-span-4 row-span-2">
              <Card className="h-full min-h-[280px]">
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tablet/Desktop layout */}
          <div className="hidden xl:grid 2xl:hidden xl:grid-cols-4 gap-6">
            {/* Row 1 */}
            <div className="col-span-2">
              <Card className="h-full min-h-[300px]">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-2">
              <Card className="h-full min-h-[300px]">
                <CardHeader>
                  <Skeleton className="h-6 w-28" />
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </CardContent>
              </Card>
            </div>

            {/* Row 2 */}
            <div className="col-span-2">
              <Card className="h-full min-h-[350px]">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="col-span-2">
              <Card className="h-full min-h-[350px]">
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="grid xl:hidden grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Intelligent loading indicator that only shows after a delay
export const DelayedSkeleton = ({ 
  children, 
  delay = 200,
  fallback = <TaskDetailSkeleton />
}: {
  children: React.ReactNode;
  delay?: number;
  fallback?: React.ReactNode;
}) => {
  return children || fallback;
};