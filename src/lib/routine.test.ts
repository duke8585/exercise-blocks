import { describe, expect, it } from "vitest";
import type { Exercise, MuscleGroup } from "../types";
import { generateRoutine } from "./routine";

const exercises: Exercise[] = [
  {
    id: "shoulder-1",
    name: "Shoulder 1",
    primaryGroup: "shoulders",
    tags: ["test"]
  },
  {
    id: "shoulder-2",
    name: "Shoulder 2",
    primaryGroup: "shoulders",
    tags: ["test"]
  },
  {
    id: "shoulder-3",
    name: "Shoulder 3",
    primaryGroup: "shoulders",
    tags: ["test"]
  },
  { id: "chest-1", name: "Chest 1", primaryGroup: "chest", tags: ["test"] },
  { id: "chest-2", name: "Chest 2", primaryGroup: "chest", tags: ["test"] },
  { id: "chest-3", name: "Chest 3", primaryGroup: "chest", tags: ["test"] },
  {
    id: "abductor-1",
    name: "Abductor 1",
    primaryGroup: "abductors",
    tags: ["test"]
  }
];

describe("generateRoutine", () => {
  it("only selects exercises from checked primary groups", () => {
    const routine = generateRoutine(exercises, ["shoulders", "chest"], 6, fixedRng());

    expect(routine).toHaveLength(6);
    expect(
      routine.every((exercise) =>
        ["shoulders", "chest"].includes(exercise.primaryGroup)
      )
    ).toBe(true);
  });

  it("balances selected groups by group instead of library size", () => {
    const routine = generateRoutine(
      exercises,
      ["shoulders", "chest", "abductors"],
      7,
      fixedRng()
    );
    const counts = countGroups(routine);

    expect(counts.shoulders).toBe(3);
    expect(counts.chest).toBe(3);
    expect(counts.abductors).toBe(1);
  });

  it("avoids duplicates when enough eligible exercises exist", () => {
    const routine = generateRoutine(exercises, ["shoulders", "chest"], 6, fixedRng());
    const uniqueIds = new Set(routine.map((exercise) => exercise.id));

    expect(uniqueIds.size).toBe(6);
  });

  it("returns an empty routine when no selected group has exercises", () => {
    expect(generateRoutine(exercises, ["core"], 10, fixedRng())).toEqual([]);
  });
});

function countGroups(routine: Exercise[]): Partial<Record<MuscleGroup, number>> {
  return routine.reduce<Partial<Record<MuscleGroup, number>>>((counts, exercise) => {
    counts[exercise.primaryGroup] = (counts[exercise.primaryGroup] ?? 0) + 1;
    return counts;
  }, {});
}

function fixedRng(): () => number {
  return () => 0;
}
