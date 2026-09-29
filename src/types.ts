export const MUSCLE_GROUP_OPTIONS = [
  { id: "spine_flexion_extension", label: "Spine flex/extend" },
  { id: "glutes", label: "Glutes" },
  { id: "abductors", label: "Abductors" },
  { id: "adductors", label: "Adductors" },
  { id: "quads", label: "Quads" },
  { id: "hamstrings", label: "Hamstrings" },
  { id: "calves", label: "Calves" },
  { id: "core", label: "Core" },
  { id: "shoulders", label: "Shoulders" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "cardio_hiit", label: "Cardio/HIIT" }
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUP_OPTIONS)[number]["id"];

export type SideMode = "leftRight" | "single";

// Rough ramp signal used to order a generated routine from light to heavy so a
// session never opens on a loaded lift. Only the extremes are tagged in the
// seed library; everything untagged is treated as "work".
export type Intensity = "warmup" | "work" | "peak";

export interface ExerciseLink {
  label: string;
  url: string;
}

export interface Exercise {
  id: string;
  name: string;
  groups: MuscleGroup[];
  tags: string[];
  sideMode?: SideMode;
  intensity?: Intensity;
  description?: string;
  notes?: string;
  links?: ExerciseLink[];
  // Explicit demonstration video; when set the card links straight here instead
  // of running the generic YouTube search.
  videoUrl?: string;
}

// One work block per exercise. A single cue marks the halfway point, which is
// the side switch for left/right exercises.
export interface TimerConfig {
  exerciseSeconds: number;
}

export interface StoredAppConfig {
  version: 1;
  exercises: Exercise[];
  starredIds: string[];
  settings: {
    routineCount: number;
    timer: TimerConfig;
  };
}

export interface CurrentWorkout {
  exercises: Exercise[];
}

export interface RoutineExercise extends Exercise {
  instanceId: string;
}

// A fixed, hand-built session: an explicit list of library exercise ids that
// loads straight into the routine instead of going through the random picker.
export interface WorkoutPreset {
  id: string;
  name: string;
  focus: string;
  exerciseIds: string[];
}
