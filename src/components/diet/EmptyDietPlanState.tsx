import { ChefHat, Plus, RefreshCcw, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyDietPlanStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateNew?: () => void;
}

export const EmptyDietPlanState = ({
  hasFilters = false,
  onClearFilters,
  onCreateNew,
}: EmptyDietPlanStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <ChefHat className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {hasFilters ? 'No diet plans match your filters' : 'No diet plans yet'}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasFilters
          ? 'Try adjusting your search criteria or clear all filters to see all diet plans.'
          : 'Create your first diet plan to help members achieve their nutrition goals.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasFilters ? (
          <>
            <Button variant="outline" onClick={onClearFilters} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Plan
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Plan
            </Button>
            <Button variant="outline" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Watch Tutorial
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
