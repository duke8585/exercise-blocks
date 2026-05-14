import { describe, expect, it } from "vitest";
import { seedExercises } from "./seedExercises";

describe("seedExercises", () => {
  it("has unique exercise ids after inventory consolidation", () => {
    const ids = seedExercises.map((exercise) => exercise.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tags every exercise with an inventory version", () => {
    expect(seedExercises.every((exercise) => exercise.tags.length > 0)).toBe(true);
    expect(
      seedExercises.every((exercise) =>
        exercise.tags.some((tag) => tag.startsWith("inventory:v"))
      )
    ).toBe(true);
  });

  it("includes the cardio/HIIT inventory and requested v2 sequence", () => {
    expect(
      seedExercises.some(
        (exercise) =>
          exercise.primaryGroup === "cardio_hiit" &&
          exercise.tags.includes("inventory:v1")
      )
    ).toBe(true);

    expect(
      [
        "hopping-shaking",
        "jumping-twists",
        "pump-stretch-down-dog-up-dog",
        "hindu-push-up",
        "straddle",
        "90-90-hip-switch",
        "cossack-squat",
        "windshield-wipers"
      ].every((id) =>
        seedExercises.some(
          (exercise) => exercise.id === id && exercise.tags.includes("inventory:v2")
        )
      )
    ).toBe(true);
  });
});
