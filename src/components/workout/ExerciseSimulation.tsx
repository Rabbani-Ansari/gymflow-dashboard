import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Exercise to GIF mapping - using free exercise GIFs from public sources
// These are placeholder URLs - in production, you'd use ExerciseDB API or similar
const EXERCISE_GIFS: Record<string, string> = {
  // Chest exercises
  'bench press': 'https://media.giphy.com/media/fU4ElZM5rQW7Qtkca0/giphy.gif',
  'push-ups': 'https://media.giphy.com/media/OqFqUw1o8k8uWP4O2Y/giphy.gif',
  'incline dumbbell press': 'https://media.giphy.com/media/fU4ElZM5rQW7Qtkca0/giphy.gif',
  'cable flyes': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'decline press': 'https://media.giphy.com/media/fU4ElZM5rQW7Qtkca0/giphy.gif',
  'chest press': 'https://media.giphy.com/media/fU4ElZM5rQW7Qtkca0/giphy.gif',
  
  // Back exercises
  'deadlifts': 'https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif',
  'pull-ups': 'https://media.giphy.com/media/xUA7bguzIUeim7bFV6/giphy.gif',
  'bent over rows': 'https://media.giphy.com/media/l0HUfPOnvdomnsz0A/giphy.gif',
  'lat pulldowns': 'https://media.giphy.com/media/l0HUfPOnvdomnsz0A/giphy.gif',
  'seated cable rows': 'https://media.giphy.com/media/l0HUfPOnvdomnsz0A/giphy.gif',
  'rows': 'https://media.giphy.com/media/l0HUfPOnvdomnsz0A/giphy.gif',
  
  // Legs exercises
  'barbell squats': 'https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif',
  'squats': 'https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif',
  'leg press': 'https://media.giphy.com/media/3o6nV0VFdYgsB9ldD2/giphy.gif',
  'romanian deadlifts': 'https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif',
  'lunges': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  'leg curls': 'https://media.giphy.com/media/3o6nV0VFdYgsB9ldD2/giphy.gif',
  'calf raises': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  
  // Arms exercises
  'barbell curls': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'bicep curls': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'tricep dips': 'https://media.giphy.com/media/OqFqUw1o8k8uWP4O2Y/giphy.gif',
  'hammer curls': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'skull crushers': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'tricep pushdowns': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  
  // Shoulders exercises
  'overhead press': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'shoulder press': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'lateral raises': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  'face pulls': 'https://media.giphy.com/media/l0HUfPOnvdomnsz0A/giphy.gif',
  'front raises': 'https://media.giphy.com/media/3oriO5EMLxl1f7funu/giphy.gif',
  
  // Core exercises
  'plank': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  'russian twists': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  'leg raises': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  'mountain climbers': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  'bicycle crunches': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  'crunches': 'https://media.giphy.com/media/xT39CWVqYbJaFPbEgU/giphy.gif',
  
  // Full body exercises
  'burpees': 'https://media.giphy.com/media/23hPPMRgPxbNBlPQe3/giphy.gif',
  'kettlebell swings': 'https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif',
  'clean and press': 'https://media.giphy.com/media/1qfDU4MJv9xoGtRKvh/giphy.gif',
  'jumping jacks': 'https://media.giphy.com/media/23hPPMRgPxbNBlPQe3/giphy.gif',
};

// Default exercise GIF for unknown exercises
const DEFAULT_GIF = 'https://media.giphy.com/media/OqFqUw1o8k8uWP4O2Y/giphy.gif';

// Find best matching GIF for an exercise
const getExerciseGif = (exerciseName: string): string => {
  const normalizedName = exerciseName.toLowerCase().trim();
  
  // Exact match
  if (EXERCISE_GIFS[normalizedName]) {
    return EXERCISE_GIFS[normalizedName];
  }
  
  // Partial match
  for (const [key, url] of Object.entries(EXERCISE_GIFS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return url;
    }
  }
  
  // Check for keywords
  const keywords = normalizedName.split(' ');
  for (const keyword of keywords) {
    for (const [key, url] of Object.entries(EXERCISE_GIFS)) {
      if (key.includes(keyword) && keyword.length > 3) {
        return url;
      }
    }
  }
  
  return DEFAULT_GIF;
};

interface ExerciseSimulationProps {
  exerciseName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showControls?: boolean;
  autoplay?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export const ExerciseSimulation = ({
  exerciseName,
  size = 'md',
  className,
  showControls = true,
  autoplay = true,
}: ExerciseSimulationProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const gifUrl = getExerciseGif(exerciseName);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Static frame for paused state (shows first frame)
  const staticUrl = gifUrl.replace('.gif', '_s.gif');

  return (
    <>
      <div 
        className={cn(
          'relative group rounded-lg overflow-hidden bg-muted cursor-pointer',
          sizeClasses[size],
          className
        )}
        onClick={() => showControls && setShowFullscreen(true)}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}

        {/* Error fallback */}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center p-2">
              <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[8px] text-muted-foreground truncate">{exerciseName}</p>
            </div>
          </div>
        ) : (
          <>
            {/* GIF Image */}
            <img
              ref={imgRef}
              src={isPlaying && !prefersReducedMotion ? gifUrl : gifUrl}
              alt={`${exerciseName} demonstration`}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
            />

            {/* Play/Pause overlay */}
            {showControls && !isLoading && (
              <div 
                className={cn(
                  'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                )}
              >
                <Maximize2 className="w-1/4 h-1/4 text-white" />
              </div>
            )}
          </>
        )}

        {/* Live indicator */}
        {isPlaying && !isLoading && !hasError && (
          <div className="absolute top-1 right-1 flex items-center gap-1 px-1.5 py-0.5 bg-red-500 rounded text-[8px] text-white font-medium">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {exerciseName}
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded text-xs text-white font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <img
              src={gifUrl}
              alt={`${exerciseName} demonstration`}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePlay}>
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              if (imgRef.current) {
                imgRef.current.src = '';
                imgRef.current.src = gifUrl;
              }
            }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Mini inline simulation for exercise rows
interface MiniExerciseSimulationProps {
  exerciseName: string;
  className?: string;
}

export const MiniExerciseSimulation = ({ exerciseName, className }: MiniExerciseSimulationProps) => {
  return (
    <ExerciseSimulation
      exerciseName={exerciseName}
      size="sm"
      className={cn('flex-shrink-0', className)}
      showControls={true}
      autoplay={true}
    />
  );
};

// Card simulation for exercise library
interface ExerciseCardSimulationProps {
  exerciseName: string;
  className?: string;
}

export const ExerciseCardSimulation = ({ exerciseName, className }: ExerciseCardSimulationProps) => {
  return (
    <ExerciseSimulation
      exerciseName={exerciseName}
      size="lg"
      className={cn('rounded-lg', className)}
      showControls={true}
      autoplay={true}
    />
  );
};

// Large simulation for workout detail view
interface LargeExerciseSimulationProps {
  exerciseName: string;
  sets?: number;
  reps?: string;
  rest?: string;
  className?: string;
}

export const LargeExerciseSimulation = ({ 
  exerciseName, 
  sets,
  reps,
  rest,
  className 
}: LargeExerciseSimulationProps) => {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <ExerciseSimulation
        exerciseName={exerciseName}
        size="xl"
        showControls={true}
        autoplay={true}
      />
      <div className="text-center">
        <p className="text-lg font-semibold">{exerciseName}</p>
        {sets && reps && (
          <p className="text-muted-foreground">{sets} × {reps}</p>
        )}
        {rest && (
          <p className="text-sm text-muted-foreground">Rest: {rest}</p>
        )}
      </div>
    </div>
  );
};
