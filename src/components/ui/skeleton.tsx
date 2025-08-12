import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Task item skeleton
export const TaskItemSkeleton: React.FC = () => (
  <div className="p-4 border border-border rounded-lg bg-card animate-fade-in">
    <div className="flex items-start gap-3">
      <Skeleton className="w-4 h-4 mt-1 rounded-sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// Folder item skeleton
export const FolderItemSkeleton: React.FC = () => (
  <div className="p-4 border border-border rounded-lg bg-card animate-fade-in">
    <div className="flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-6 h-6 rounded" />
    </div>
  </div>
);

// List skeleton for multiple items
export const ListSkeleton: React.FC<{ count?: number; type?: 'task' | 'folder' }> = ({ 
  count = 5, 
  type = 'task' 
}) => {
  const SkeletonComponent = type === 'task' ? TaskItemSkeleton : FolderItemSkeleton;
  
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

export { Skeleton }
