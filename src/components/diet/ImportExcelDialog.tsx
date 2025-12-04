import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => void;
}

type ImportStep = 'upload' | 'preview' | 'mapping' | 'importing' | 'complete';

const REQUIRED_COLUMNS = ['Plan Name', 'Trainer', 'Calories', 'Category'];
const OPTIONAL_COLUMNS = ['Protein', 'Carbs', 'Fat', 'Members'];

// Mock parsed data
const MOCK_PREVIEW_DATA = [
  { col1: 'Lean Muscle Plan', col2: 'John Trainer', col3: '2200', col4: 'muscle-gain' },
  { col1: 'Weight Loss Basic', col2: 'Jane Coach', col3: '1800', col4: 'weight-loss' },
  { col1: 'Maintenance Diet', col2: 'Mike Fitness', col3: '2000', col4: 'maintenance' },
];

export const ImportExcelDialog = ({
  open,
  onOpenChange,
  onImport,
}: ImportExcelDialogProps) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      // Simulate parsing
      setTimeout(() => {
        setPreviewData(MOCK_PREVIEW_DATA);
        setStep('preview');
      }, 500);
    } else {
      toast.error('Please upload a CSV or Excel file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTimeout(() => {
        setPreviewData(MOCK_PREVIEW_DATA);
        setStep('preview');
      }, 500);
    }
  };

  const handleMapping = (column: string, targetField: string) => {
    setColumnMapping((prev) => ({ ...prev, [column]: targetField }));
  };

  const validateMapping = () => {
    const mappedFields = Object.values(columnMapping);
    const missingRequired = REQUIRED_COLUMNS.filter(
      (col) => !mappedFields.includes(col)
    );
    
    if (missingRequired.length > 0) {
      setErrors(missingRequired.map((col) => `Missing required column: ${col}`));
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleImport = async () => {
    if (!validateMapping()) {
      toast.error('Please fix mapping errors before importing');
      return;
    }

    setStep('importing');
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    setStep('complete');
    toast.success(`Successfully imported ${previewData.length} diet plans`);
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setPreviewData([]);
    setColumnMapping({});
    setErrors([]);
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Diet Plans
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV or Excel file to import diet plans'}
            {step === 'preview' && 'Preview your data before importing'}
            {step === 'mapping' && 'Map your columns to the required fields'}
            {step === 'importing' && 'Importing your data...'}
            {step === 'complete' && 'Import completed successfully!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drag and drop your file here</p>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm font-medium">{file?.name}</span>
                <Badge variant="secondary">{previewData.length} rows</Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column A</TableHead>
                      <TableHead>Column B</TableHead>
                      <TableHead>Column C</TableHead>
                      <TableHead>Column D</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.col1}</TableCell>
                        <TableCell>{row.col2}</TableCell>
                        <TableCell>{row.col3}</TableCell>
                        <TableCell>{row.col4}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button onClick={() => setStep('mapping')} className="w-full">
                Continue to Column Mapping
              </Button>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Map each column from your file to the corresponding field:
              </p>

              <div className="space-y-3">
                {['Column A', 'Column B', 'Column C', 'Column D'].map((col, idx) => (
                  <div key={col} className="flex items-center gap-4">
                    <span className="text-sm w-24">{col}</span>
                    <span className="text-muted-foreground">→</span>
                    <Select
                      value={columnMapping[col] || ''}
                      onValueChange={(value) => handleMapping(col, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                            {REQUIRED_COLUMNS.includes(field) && ' *'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {errors.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg space-y-1">
                  {errors.map((error, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="py-8 text-center space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Importing {previewData.length} diet plans... {progress}%
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="py-8 text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium">Import Successful!</p>
              <p className="text-sm text-muted-foreground">
                {previewData.length} diet plans have been imported.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button onClick={handleImport}>Import {previewData.length} Plans</Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose}>Done</Button>
          )}
          {(step === 'upload' || step === 'preview') && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
