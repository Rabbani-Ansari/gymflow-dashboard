import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export const DietPlanCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <div className="pt-3 border-t">
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  );
};

export const DietPlanCardSkeletonGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <DietPlanCardSkeleton key={idx} />
      ))}
    </>
  );
};
