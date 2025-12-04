import { Dumbbell, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyWorkoutStateProps {
  type: 'no-workouts' | 'no-results';
  onCreateClick?: () => void;
  onClearFilters?: () => void;
}

export const EmptyWorkoutState = ({
  type,
  onCreateClick,
  onClearFilters,
}: EmptyWorkoutStateProps) => {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No workouts found</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          No workouts match your current filters. Try adjusting your search criteria or clear the
          filters to see all workouts.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Dumbbell className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Workout Routines Yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Get started by creating your first workout routine. Design exercise programs for your gym
        members with detailed sets, reps, and rest periods.
      </p>
      {onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Workout
        </Button>
      )}
    </div>
  );
};
