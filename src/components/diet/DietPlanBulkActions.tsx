import { useState } from 'react';
import { Check, Copy, Download, FileSpreadsheet, MoreHorizontal, Send, Archive, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DietPlan } from '@/types';

interface DietPlanBulkActionsProps {
  selectedPlans: string[];
  totalPlans: number;
  onSelectAll: (selected: boolean) => void;
  onBulkAssign: () => void;
  onBulkDuplicate: () => void;
  onImportExcel: () => void;
  plans: DietPlan[];
}

export const DietPlanBulkActions = ({
  selectedPlans,
  totalPlans,
  onSelectAll,
  onBulkAssign,
  onBulkDuplicate,
  onImportExcel,
  plans,
}: DietPlanBulkActionsProps) => {
  const isAllSelected = selectedPlans.length === totalPlans && totalPlans > 0;
  const isPartialSelected = selectedPlans.length > 0 && selectedPlans.length < totalPlans;
  const hasSelection = selectedPlans.length > 0;

  const handleExportCSV = () => {
    const selectedData = plans.filter(p => selectedPlans.includes(p.id));
    const headers = ['Name', 'Category', 'Trainer', 'Target Calories', 'Protein', 'Carbs', 'Fat', 'Members'];
    const rows = selectedData.map(p => [
      p.name,
      p.category,
      p.trainer,
      p.targetCalories,
      p.macros.protein,
      p.macros.carbs,
      p.macros.fat,
      p.members.length,
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diet-plans-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedData.length} diet plans to CSV`);
  };

  const handleExportPDF = () => {
    toast.success(`PDF export started for ${selectedPlans.length} plans`);
  };

  const handleArchive = () => {
    toast.success(`${selectedPlans.length} plans archived`);
  };

  const handleSendReminders = () => {
    toast.success(`Reminders sent to members of ${selectedPlans.length} plans`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          ref={(el) => {
            if (el) {
              (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isPartialSelected;
            }
          }}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
        />
        <span className="text-sm text-muted-foreground">
          {hasSelection ? `${selectedPlans.length}/${totalPlans} selected` : 'Select All'}
        </span>
      </div>

      <div className="h-6 w-px bg-border" />

      <Button
        variant="outline"
        size="sm"
        onClick={onBulkAssign}
        disabled={!hasSelection}
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        Assign Multiple ({selectedPlans.length})
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onBulkDuplicate}
        disabled={!hasSelection}
        className="gap-2"
      >
        <Copy className="h-4 w-4" />
        Duplicate
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={!hasSelection} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MoreHorizontal className="h-4 w-4" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onImportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import Excel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleArchive} disabled={!hasSelection}>
            <Archive className="h-4 w-4 mr-2" />
            Archive Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendReminders} disabled={!hasSelection}>
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
