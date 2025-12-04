import { Skeleton } from '@/components/ui/skeleton';

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
}

export const DataTableSkeleton = ({ columns = 6, rows = 5 }: DataTableSkeletonProps) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-border last:border-0 p-4">
          <div className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={colIndex === 0 ? 'h-10 w-10 rounded-full flex-shrink-0' : 'h-4 flex-1'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
