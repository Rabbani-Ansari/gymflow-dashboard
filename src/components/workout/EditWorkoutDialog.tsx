import { useState, useEffect } from 'react';
import {
  Save,
  X,
  Copy,
  Trash2,
  Plus,
  GripVertical,
  Play,
  ExternalLink,
} from 'lucide-react';
import { MiniExerciseSimulation } from './ExerciseSimulation';
import { Workout, Exercise } from '@/types';
import { trainers } from '@/data/mockData';
import { exerciseCatalog } from '@/data/exerciseCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type BodyPart = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full-body';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type Equipment = 'free-weights' | 'machines' | 'bodyweight' | 'mixed';

interface EditWorkoutDialogProps {
  workout: Workout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workout: Workout) => void;
  onDelete: (workoutId: string) => void;
  onDuplicate: (workout: Workout) => void;
}

const BODY_PARTS: { value: BodyPart; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'core', label: 'Core' },
  { value: 'full-body', label: 'Full Body' },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'free-weights', label: 'Free Weights' },
  { value: 'machines', label: 'Machines' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'mixed', label: 'Mixed' },
];



const emptyExercise: Exercise = {
  name: '',
  sets: 3,
  reps: '10-12',
  rest: '60s',
  notes: '',
};

export const EditWorkoutDialog = ({
  workout,
  open,
  onOpenChange,
  onSave,
  onDelete,
  onDuplicate,
}: EditWorkoutDialogProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart>('chest');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [equipment, setEquipment] = useState<Equipment>('mixed');
  const [duration, setDuration] = useState(60);
  const [trainerId, setTrainerId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Exercise library search
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setBodyPart(workout.bodyPart);
      setDifficulty(workout.difficulty);
      setEquipment(workout.equipment);
      setDuration(workout.duration);
      setTrainerId(workout.trainerId);
      setVideoUrl(workout.videoUrl || '');
      setExercises([...workout.exercises]);
    } else {
      // Reset for new workout
      setName('');
      setBodyPart('chest');
      setDifficulty('intermediate');
      setEquipment('mixed');
      setDuration(60);
      setTrainerId('');
      setVideoUrl('');
      setExercises([]);
    }
  }, [workout, open]);

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  const filteredExerciseLibrary = exerciseCatalog.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const handleAddExercise = (exerciseName: string) => {
    setExercises([...exercises, { ...emptyExercise, name: exerciseName }]);
    setExerciseSearch('');
  };

  const handleUpdateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newExercises = [...exercises];
    const draggedItem = newExercises[draggedIndex];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(index, 0, draggedItem);

    setExercises(newExercises);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Workout name is required');
      return;
    }
    if (!trainerId) {
      toast.error('Please select a trainer');
      return;
    }
    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }

    const trainer = trainers.find((t) => t.id === trainerId);

    const updatedWorkout: Workout = {
      id: workout?.id || `workout_${Date.now()}`,
      name,
      bodyPart,
      difficulty,
      equipment,
      duration,
      trainerId,
      trainer: trainer?.name || '',
      videoUrl: videoUrl || undefined,
      exercises,
      members: workout?.members || [],
      usageCount: workout?.usageCount || 0,
      thumbnail: workout?.thumbnail || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    };

    onSave(updatedWorkout);
    toast.success(workout ? 'Workout updated successfully!' : 'Workout created successfully!');
    onOpenChange(false);
  };

  const handleDuplicate = () => {
    if (!workout) return;
    const trainer = trainers.find((t) => t.id === trainerId);

    const duplicatedWorkout: Workout = {
      id: `workout_${Date.now()}`,
      name: `${name} (Copy)`,
      bodyPart,
      difficulty,
      equipment,
      duration,
      trainerId,
      trainer: trainer?.name || '',
      videoUrl: videoUrl || undefined,
      exercises: [...exercises],
      members: [],
      usageCount: 0,
      thumbnail: workout.thumbnail,
    };

    onDuplicate(duplicatedWorkout);
    toast.success('Workout duplicated!');
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!workout) return;
    onDelete(workout.id);
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
    toast.success('Workout deleted');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl">
              {workout ? 'Edit Workout' : 'Create Workout'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-6 border-b border-border">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-4">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                >
                  Basic Details
                </TabsTrigger>
                <TabsTrigger
                  value="exercises"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                >
                  Exercises ({exercises.length})
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                >
                  Video
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(90vh-220px)]">
              <div className="px-6 py-4">
                {/* Basic Details Tab */}
                <TabsContent value="basic" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="workoutName">Workout Name *</Label>
                        <Input
                          id="workoutName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Chest Day Advanced"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Target Body Part *</Label>
                        <Select value={bodyPart} onValueChange={(v) => setBodyPart(v as BodyPart)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BODY_PARTS.map((bp) => (
                              <SelectItem key={bp.value} value={bp.value}>
                                {bp.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Difficulty Level *</Label>
                        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Equipment Required *</Label>
                        <Select value={equipment} onValueChange={(v) => setEquipment(v as Equipment)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EQUIPMENT_OPTIONS.map((eq) => (
                              <SelectItem key={eq.value} value={eq.value}>
                                {eq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Assigned Trainer *</Label>
                        <Select value={trainerId} onValueChange={setTrainerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trainer" />
                          </SelectTrigger>
                          <SelectContent>
                            {trainers.map((trainer) => (
                              <SelectItem key={trainer.id} value={trainer.id}>
                                {trainer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration: {duration} minutes</Label>
                        <Slider
                          value={[duration]}
                          onValueChange={([v]) => setDuration(v)}
                          min={15}
                          max={120}
                          step={5}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>15 min</span>
                          <span>120 min</span>
                        </div>
                      </div>

                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Workout Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Exercises</p>
                              <p className="font-semibold">{exercises.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Sets</p>
                              <p className="font-semibold">
                                {exercises.reduce((acc, ex) => acc + ex.sets, 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Est. Duration</p>
                              <p className="font-semibold">{duration} min</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Difficulty</p>
                              <Badge variant="outline" className="capitalize">
                                {difficulty}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Exercises Tab */}
                <TabsContent value="exercises" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Exercise Library */}
                    <Card className="lg:col-span-1">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Exercise Library</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input
                          placeholder="Search exercises..."
                          value={exerciseSearch}
                          onChange={(e) => setExerciseSearch(e.target.value)}
                        />
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-1">
                            {filteredExerciseLibrary.map((ex) => (
                              <Button
                                key={ex.name}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 group"
                                onClick={() => handleAddExercise(ex.name)}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <MiniExerciseSimulation exerciseName={ex.name} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                  <span className="truncate">{ex.name}</span>
                                </div>
                                <Badge variant="outline" className="ml-auto text-xs capitalize flex-shrink-0">
                                  {ex.category}
                                </Badge>
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddExercise(exerciseSearch || 'Custom Exercise')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add "{exerciseSearch || 'Custom Exercise'}"
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Exercise List */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Workout Exercises</h4>
                        <span className="text-sm text-muted-foreground">
                          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {exercises.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground border-dashed">
                          <p>No exercises added yet.</p>
                          <p className="text-sm">Select from the library or add custom exercises.</p>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {exercises.map((exercise, idx) => (
                            <Card
                              key={idx}
                              className={`p-4 transition-all ${draggedIndex === idx ? 'opacity-50 border-primary' : ''}`}
                              draggable
                              onDragStart={() => handleDragStart(idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="flex items-start gap-3">
                                {/* Exercise Simulation */}
                                <MiniExerciseSimulation
                                  exerciseName={exercise.name}
                                  className="mt-6"
                                />

                                <div className="flex flex-col gap-1 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground text-center">
                                    {idx + 1}
                                  </span>
                                </div>

                                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div className="col-span-2 md:col-span-2">
                                    <Label className="text-xs">Exercise Name</Label>
                                    <Input
                                      value={exercise.name}
                                      onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                                      placeholder="Exercise name"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Sets</Label>
                                    <Input
                                      type="number"
                                      value={exercise.sets}
                                      onChange={(e) => handleUpdateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                                      min={1}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Reps</Label>
                                    <Input
                                      value={exercise.reps}
                                      onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                                      placeholder="10-12"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Rest</Label>
                                    <Input
                                      value={exercise.rest}
                                      onChange={(e) => handleUpdateExercise(idx, 'rest', e.target.value)}
                                      placeholder="60s"
                                    />
                                  </div>
                                  <div className="col-span-2 md:col-span-5">
                                    <Label className="text-xs">Notes (optional)</Label>
                                    <Input
                                      value={exercise.notes || ''}
                                      onChange={(e) => handleUpdateExercise(idx, 'notes', e.target.value)}
                                      placeholder="Form tips, variations..."
                                    />
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveExercise(idx)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Video Tab */}
                <TabsContent value="video" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">YouTube Video URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="videoUrl"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {videoUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(videoUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add a demonstration video for this workout routine
                      </p>
                    </div>

                    {embedUrl && (
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Video Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="aspect-video">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Workout video preview"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {!embedUrl && videoUrl && (
                      <Card className="p-8 text-center text-muted-foreground border-dashed">
                        <p>Invalid YouTube URL</p>
                        <p className="text-sm">Please enter a valid YouTube video URL</p>
                      </Card>
                    )}

                    {!videoUrl && (
                      <Card className="p-8 text-center text-muted-foreground border-dashed">
                        <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No video added</p>
                        <p className="text-sm">Paste a YouTube URL above to add a demonstration video</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t border-border gap-2">
            <div className="flex gap-2 mr-auto">
              {workout && (
                <>
                  <Button variant="outline" onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {workout ? 'Save Changes' : 'Create Workout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workout
              "{workout?.name}" and remove it from {workout?.members.length || 0} assigned member(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
