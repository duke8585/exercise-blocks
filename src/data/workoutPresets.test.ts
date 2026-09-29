import { describe, expect, it } from "vitest";
import { buildWorkout } from "../lib/routine";
import type { Intensity } from "../types";
import { seedExercises } from "./seedExercises";
import { workoutPresets } from "./workoutPresets";

const RANK: Record<Intensity, number> = { warmup: 0, work: 1, peak: 2 };

describe("workoutPresets", () => {
  it("only references exercises that exist in the seed library", () => {
    const ids = new Set(seedExercises.map((exercise) => exercise.id));
    for (const preset of workoutPresets) {
      for (const id of preset.exerciseIds) {
        expect(ids.has(id), `${preset.id} references missing ${id}`).toBe(true);
      }
    }
  });

  it("has unique preset ids and no repeated exercise within a preset", () => {
    const presetIds = workoutPresets.map((preset) => preset.id);
    expect(new Set(presetIds).size).toBe(presetIds.length);
    for (const preset of workoutPresets) {
      expect(new Set(preset.exerciseIds).size).toBe(preset.exerciseIds.length);
    }
  });

  it("loads each preset as a warmup -> peak ramp", () => {
    for (const preset of workoutPresets) {
      const { exercises, missingIds } = buildWorkout(preset, seedExercises);
      expect(missingIds).toEqual([]);
      const ranks = exercises.map((exercise) => RANK[exercise.intensity ?? "work"]);
      expect(ranks, preset.id).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it("reports exercises missing from the library instead of failing", () => {
    const preset = workoutPresets[0];
    const library = seedExercises.filter((exercise) => exercise.id !== preset.exerciseIds[0]);
    const { exercises, missingIds } = buildWorkout(preset, library);

    expect(missingIds).toEqual([preset.exerciseIds[0]]);
    expect(exercises).toHaveLength(preset.exerciseIds.length - 1);
  });
});
