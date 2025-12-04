import { useState } from 'react';
import {
  CheckSquare,
  Square,
  Copy,
  UserPlus,
  Download,
  Upload,
  Trash2,
  X,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { Workout } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface WorkoutBulkActionsProps {
  selectedWorkouts: string[];
  workouts: Workout[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkAssign: (workoutIds: string[]) => void;
  onBulkDuplicate: (workoutIds: string[]) => void;
  onBulkDelete: (workoutIds: string[]) => void;
  totalCount: number;
}

export const WorkoutBulkActions = ({
  selectedWorkouts,
  workouts,
  onClearSelection,
  onSelectAll,
  onBulkAssign,
  onBulkDuplicate,
  onBulkDelete,
  totalCount,
}: WorkoutBulkActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const selectedWorkoutNames = workouts
    .filter((w) => selectedWorkouts.includes(w.id))
    .map((w) => w.name);

  const totalAssignedMembers = workouts
    .filter((w) => selectedWorkouts.includes(w.id))
    .reduce((acc, w) => acc + w.members.length, 0);

  const handleExportCSV = () => {
    const selectedWorkoutData = workouts.filter((w) => selectedWorkouts.includes(w.id));
    const csvContent = [
      ['Name', 'Body Part', 'Difficulty', 'Duration', 'Trainer', 'Exercises', 'Members Assigned'].join(','),
      ...selectedWorkoutData.map((w) =>
        [
          `"${w.name}"`,
          w.bodyPart,
          w.difficulty,
          w.duration,
          `"${w.trainer}"`,
          w.exercises.length,
          w.members.length,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workouts_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedWorkouts.length} workout(s) to CSV`);
  };

  const handleExportPDF = () => {
    // Simulated PDF export
    toast.success(`PDF export started for ${selectedWorkouts.length} workout(s)`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast.success(`Importing workouts from ${file.name}...`);
        // Simulate import
        setTimeout(() => {
          toast.success('Import completed successfully!');
        }, 1500);
      }
    };
    input.click();
  };

  if (selectedWorkouts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm">
              {selectedWorkouts.length} of {totalCount} selected
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-8"
          >
            {selectedWorkouts.length === totalCount ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAssign(selectedWorkouts)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkDuplicate(selectedWorkouts)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedWorkouts.length} Workout(s)?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This action cannot be undone. The following workouts will be permanently deleted:</p>
              <ul className="list-disc list-inside text-sm mt-2 max-h-[150px] overflow-auto">
                {selectedWorkoutNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              {totalAssignedMembers > 0 && (
                <p className="text-destructive font-medium mt-2">
                  Warning: These workouts are assigned to {totalAssignedMembers} member(s).
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBulkDelete(selectedWorkouts);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedWorkouts.length} Workout(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
