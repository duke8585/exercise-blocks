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
  description?: string;
  notes?: string;
  links?: ExerciseLink[];
}

export interface TimerConfig {
  sideASeconds: number;
  sideBSeconds: number;
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
