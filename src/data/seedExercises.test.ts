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
          exercise.groups[0] === "cardio_hiit" &&
          exercise.tags.includes("inventory:v1:cardio")
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
          (exercise) => exercise.id === id && exercise.tags.includes("inventory:v2:daily-practice")
        )
      )
    ).toBe(true);
  });

  it("carries the second-round v2 additions", () => {
    const requiredV2Ids = [
      "seated-good-mornings",
      "hyperextensions",
      "standing-good-mornings",
      "jefferson-curl",
      "copenhagen-plank",
      "banded-torso-rotations-standing",
      "sumo-squat",
      "nordic-curls",
      "reverse-nordics",
      "single-leg-deadlift"
    ];

    for (const id of requiredV2Ids) {
      const found = seedExercises.find((exercise) => exercise.id === id);
      expect(found, `missing seed: ${id}`).toBeDefined();
      expect(found?.tags).toContain("inventory:v2:daily-practice");
    }
  });

  it("retags existing entries into v2 without dropping prior tags", () => {
    const retagged = ["copenhagen-short-lever", "single-leg-rdl-reach"];

    for (const id of retagged) {
      const exercise = seedExercises.find((current) => current.id === id);
      expect(exercise, `missing seed: ${id}`).toBeDefined();
      expect(exercise?.tags).toContain("inventory:v2:daily-practice");
      // these originated in v0, so the original tag must survive the retag.
      expect(exercise?.tags).toContain("inventory:v0:fundamentals");
    }
  });

  it("carries the neck/shoulder resilience v3 additions", () => {
    const requiredV3Ids = [
      "suitcase-carry",
      "suitcase-deadlift",
      "prone-t-raise",
      "prone-w-raise",
      "scapular-pull-up",
      "band-face-pull-external-rotation",
      "chin-nod",
      "open-book",
      "foam-roller-tspine-extension"
    ];

    for (const id of requiredV3Ids) {
      const exercise = seedExercises.find((current) => current.id === id);
      expect(exercise, `missing seed: ${id}`).toBeDefined();
      expect(exercise?.tags).toContain("inventory:v3:neck-shoulder");
    }
  });

  it("retags existing entries into v3 without dropping prior tags", () => {
    const retagged = ["side-plank", "prone-y-raise"];

    for (const id of retagged) {
      const exercise = seedExercises.find((current) => current.id === id);
      expect(exercise, `missing seed: ${id}`).toBeDefined();
      expect(exercise?.tags).toContain("inventory:v3:neck-shoulder");
      // these originated in v0, so the original tag must survive the retag.
      expect(exercise?.tags).toContain("inventory:v0:fundamentals");
    }
  });

  it("groups the glute-medius / flat-feet set into v7 without dropping prior tags", () => {
    const retagged = ["banded-clamshell", "lateral-band-walk", "single-leg-glute-bridge"];

    for (const id of retagged) {
      const exercise = seedExercises.find((current) => current.id === id);
      expect(exercise, `missing seed: ${id}`).toBeDefined();
      expect(exercise?.tags).toContain("inventory:v7:glute-medius");
      // each originated in an earlier inventory, so a prior inventory tag survives.
      expect(
        exercise?.tags.some((tag) => tag !== "inventory:v7:glute-medius" && tag.startsWith("inventory:v"))
      ).toBe(true);
    }
  });
});
