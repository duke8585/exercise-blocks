import { seedExercises } from "../data/seedExercises";
import {
  MUSCLE_GROUP_OPTIONS,
  type CurrentWorkout,
  type Exercise,
  type ExerciseLink,
  type Intensity,
  type MuscleGroup,
  type SideMode,
  type StoredAppConfig,
  type TimerConfig
} from "../types";

export const STORAGE_KEY = "daily-routine-organizer-config";
export const DEFAULT_ROUTINE_COUNT = 10;
export const DEFAULT_TIMER: TimerConfig = {
  sideASeconds: 30,
  sideBSeconds: 30
};
export const EXPORT_DOCUMENTATION = {
  purpose:
    "Daily Routine Organizer import/export file. Edit exercises and settings, then import this JSON back into the app.",
  dataModel: {
    version: "Must be 1 for the current app.",
    exercises:
      "Array of exercise objects. Required fields: id, name, groups, tags. Optional fields: sideMode, description, notes, links, videoUrl.",
    tags:
      "Array of string tags. Built-in catalog tags use inventory:v0, inventory:v1, and inventory:v2. Custom imported exercises without tags receive inventory:custom.",
    groups:
      "Ordered array of muscle group ids (most relevant first). Must contain at least one value from muscleGroups. Legacy 'primaryGroup' (single string) is also accepted for backwards compatibility.",
    sideMode: "Use leftRight for side-specific exercises, or single otherwise.",
    intensity:
      "Optional ramp signal: warmup, work, or peak. Generated routines are ordered warmup first and peak last. Omitted exercises are treated as work.",
    links:
      "Optional array of { label, url } objects. Useful for YouTube or reference links.",
    videoUrl:
      "Optional explicit demonstration video URL; replaces the generic YouTube search button on the card.",
    settings:
      "routineCount is the number of exercises to generate. timer.sideASeconds and timer.sideBSeconds are positive integers.",
    starredIds:
      "Array of exercise ids that the user has starred. Persisted and exported so stars survive a JSON round-trip.",
    currentWorkout:
      "Optional generated workout snapshot. exercises is an ordered array of exercise objects. Importing this replaces the visible routine list, but it is not saved to localStorage."
  },
  muscleGroups: MUSCLE_GROUP_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label
  })),
  notStored:
    "Generated routines, selected exercise, completed checks, countdown state, and rest timer state are intentionally not persisted in localStorage. Exports may include currentWorkout as a portable snapshot."
};

const muscleGroupIds = new Set<MuscleGroup>(
  MUSCLE_GROUP_OPTIONS.map((option) => option.id)
);
const sideModes = new Set<SideMode>(["leftRight", "single"]);
const intensities = new Set<Intensity>(["warmup", "work", "peak"]);
const seedExerciseById = new Map(
  seedExercises.map((exercise) => [exercise.id, exercise])
);

export function defaultStoredConfig(): StoredAppConfig {
  return {
    version: 1,
    exercises: seedExercises,
    starredIds: [],
    settings: {
      routineCount: DEFAULT_ROUTINE_COUNT,
      timer: DEFAULT_TIMER
    }
  };
}

export function createStoredConfig(
  exercises: Exercise[],
  routineCount: number,
  timer: TimerConfig,
  starredIds: string[] = []
): StoredAppConfig {
  return coerceStoredConfig({
    version: 1,
    exercises,
    starredIds,
    settings: {
      routineCount,
      timer
    }
  });
}

export function formatConfigJson(
  config: StoredAppConfig,
  options: { currentWorkout?: Exercise[]; includeDocumentation?: boolean } = {}
): string {
  const cleanConfig = coerceStoredConfig(config);
  const currentWorkout = coerceCurrentWorkout(options.currentWorkout);
  const exportConfig = options.includeDocumentation
    ? {
        _documentation: EXPORT_DOCUMENTATION,
        ...cleanConfig,
        ...(currentWorkout ? { currentWorkout } : {})
      }
    : {
        ...cleanConfig,
        ...(currentWorkout ? { currentWorkout } : {})
      };

  return `${JSON.stringify(exportConfig, null, 2)}\n`;
}

export function createExportFilename(date = new Date()): string {
  const timestamp = [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ].join("-");
  const time = [
    padDatePart(date.getHours()),
    padDatePart(date.getMinutes()),
    padDatePart(date.getSeconds())
  ].join("");

  return `daily-routine-organizer_${timestamp}_${time}.json`;
}

export function parseConfigJson(
  json: string,
  fallback: StoredAppConfig = defaultStoredConfig()
):
  | { ok: true; config: StoredAppConfig; currentWorkout: CurrentWorkout | null }
  | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    return {
      ok: true,
      config: coerceStoredConfig(parsed, fallback),
      currentWorkout: coerceCurrentWorkout(
        isRecord(parsed) ? parsed.currentWorkout : undefined
      )
    };
  } catch {
    return {
      ok: false,
      error: "The selected file is not valid JSON."
    };
  }
}

export function loadStoredConfig(
  storage: Pick<Storage, "getItem">,
  fallback: StoredAppConfig = defaultStoredConfig()
): StoredAppConfig {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  const parsed = parseConfigJson(raw, fallback);
  return parsed.ok ? mergeSeedInventory(parsed.config) : fallback;
}

export function saveStoredConfig(
  storage: Pick<Storage, "setItem">,
  config: StoredAppConfig
): void {
  storage.setItem(STORAGE_KEY, formatConfigJson(config));
}

export function coerceStoredConfig(
  value: unknown,
  fallback: StoredAppConfig = defaultStoredConfig()
): StoredAppConfig {
  const source = isRecord(value) ? value : {};
  const settings = isRecord(source.settings) ? source.settings : {};
  const timer = isRecord(settings.timer) ? settings.timer : {};
  const exercises = coerceExercises(source.exercises);

  return {
    version: 1,
    exercises: exercises.length > 0 ? exercises : fallback.exercises,
    starredIds: coerceStringArray(source.starredIds),
    settings: {
      routineCount:
        coercePositiveInteger(settings.routineCount) ??
        fallback.settings.routineCount,
      timer: {
        sideASeconds:
          coercePositiveInteger(timer.sideASeconds) ??
          fallback.settings.timer.sideASeconds,
        sideBSeconds:
          coercePositiveInteger(timer.sideBSeconds) ??
          fallback.settings.timer.sideBSeconds
      }
    }
  };
}

function coerceExercises(
  value: unknown,
  options: { allowDuplicateIds?: boolean } = {}
): Exercise[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<string>();
  const exercises: Exercise[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const id = coerceText(item.id);
    const name = coerceText(item.name);

    // Accept new `groups` array or legacy `primaryGroup` string for backwards compat
    const legacyPrimary = coerceMuscleGroup(item.primaryGroup);
    const groups =
      coerceGroups(item.groups) ??
      (legacyPrimary ? [legacyPrimary] : undefined);

    if (
      !id ||
      !name ||
      !groups ||
      (!options.allowDuplicateIds && seenIds.has(id))
    ) {
      continue;
    }

    if (!options.allowDuplicateIds) {
      seenIds.add(id);
    }
    const seedExercise = seedExerciseById.get(id);
    const resolvedGroups = groups.length > 0 ? groups : seedExercise?.groups ?? groups;
    const sideMode = coerceSideMode(item.sideMode) ?? seedExercise?.sideMode;
    // Preserve the ramp signal through a storage round-trip, falling back to the
    // seed value so libraries persisted before intensity was carried here (which
    // dropped the field entirely) self-heal to the authoritative classification
    // on the next load instead of collapsing every move to the "work" default.
    const intensity = coerceIntensity(item.intensity) ?? seedExercise?.intensity;
    const description = coerceText(item.description) ?? seedExercise?.description;
    const notes = coerceText(item.notes) ?? seedExercise?.notes;
    const links = coerceLinks(item.links);
    const fallbackLinks = seedExercise?.links ?? [];
    const videoUrl = coerceVideoUrl(item.videoUrl) ?? seedExercise?.videoUrl;
    const tags = mergeTags(
      coerceTags(item.tags),
      seedExercise?.tags,
      seedExercise ? [] : ["inventory:custom"]
    );

    exercises.push({
      id,
      name,
      groups: resolvedGroups,
      tags,
      ...(sideMode ? { sideMode } : {}),
      ...(intensity ? { intensity } : {}),
      ...(description ? { description } : {}),
      ...(notes ? { notes } : {}),
      ...(links.length > 0
        ? { links }
        : fallbackLinks.length > 0
          ? { links: fallbackLinks }
          : {}),
      ...(videoUrl ? { videoUrl } : {})
    });
  }

  return exercises;
}

function coerceCurrentWorkout(value: unknown): CurrentWorkout | null {
  const source = Array.isArray(value)
    ? { exercises: value }
    : isRecord(value)
      ? value
      : null;

  if (!source) {
    return null;
  }

  const exercises = coerceExercises(source.exercises, { allowDuplicateIds: true });
  return exercises.length > 0 ? { exercises } : null;
}

function mergeSeedInventory(config: StoredAppConfig): StoredAppConfig {
  const exerciseById = new Map(config.exercises.map((exercise) => [exercise.id, exercise]));

  for (const seedExercise of seedExercises) {
    if (!exerciseById.has(seedExercise.id)) {
      exerciseById.set(seedExercise.id, seedExercise);
    }
  }

  return {
    ...config,
    exercises: Array.from(exerciseById.values())
  };
}

function coerceTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return mergeTags(
    value.flatMap((tag) => (typeof tag === "string" ? [tag] : []))
  );
}

function coerceLinks(value: unknown): ExerciseLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const label = coerceText(item.label);
    const url = coerceText(item.url);

    if (!label || !url || !isSafeUrl(url)) {
      return [];
    }

    return [{ label, url }];
  });
}

function coerceVideoUrl(value: unknown): string | undefined {
  const url = coerceText(value);
  return url && isSafeUrl(url) ? url : undefined;
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function coerceText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mergeTags(...tagLists: Array<string[] | undefined>): string[] {
  return Array.from(
    new Set(
      tagLists
        .flatMap((tags) => tags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function coerceMuscleGroup(value: unknown): MuscleGroup | undefined {
  return typeof value === "string" && muscleGroupIds.has(value as MuscleGroup)
    ? (value as MuscleGroup)
    : undefined;
}

function coerceGroups(value: unknown): MuscleGroup[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const valid = Array.from(
    new Set(value.flatMap((v) => (coerceMuscleGroup(v) ? [v as MuscleGroup] : [])))
  );
  return valid.length > 0 ? valid : undefined;
}

function coerceSideMode(value: unknown): SideMode | undefined {
  return typeof value === "string" && sideModes.has(value as SideMode)
    ? (value as SideMode)
    : undefined;
}

function coerceIntensity(value: unknown): Intensity | undefined {
  return typeof value === "string" && intensities.has(value as Intensity)
    ? (value as Intensity)
    : undefined;
}

function coercePositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const integer = Math.floor(value);
  return integer > 0 ? integer : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}

function padDatePart(value: number): string {
  return value.toString().padStart(2, "0");
}
