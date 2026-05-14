import { describe, expect, it } from "vitest";
import type { Exercise, MuscleGroup } from "../types";
import { generateRoutine } from "./routine";

const exercises: Exercise[] = [
  {
    id: "shoulder-1",
    name: "Shoulder 1",
    primaryGroup: "shoulders",
    tags: ["inventory:v1"]
  },
  {
    id: "shoulder-2",
    name: "Shoulder 2",
    primaryGroup: "shoulders",
    tags: ["inventory:v2"]
  },
  {
    id: "shoulder-3",
    name: "Shoulder 3",
    primaryGroup: "shoulders",
    tags: ["inventory:v2"]
  },
  {
    id: "chest-1",
    name: "Chest 1",
    primaryGroup: "chest",
    tags: ["inventory:v1"]
  },
  {
    id: "chest-2",
    name: "Chest 2",
    primaryGroup: "chest",
    tags: ["inventory:v2"]
  },
  {
    id: "chest-3",
    name: "Chest 3",
    primaryGroup: "chest",
    tags: ["inventory:v2"]
  },
  {
    id: "abductor-1",
    name: "Abductor 1",
    primaryGroup: "abductors",
    tags: ["inventory:v1"]
  }
];

describe("generateRoutine", () => {
  it("only selects exercises from checked primary groups", () => {
    const routine = generateRoutine(
      exercises,
      ["shoulders", "chest"],
      [],
      6,
      fixedRng()
    );

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
      [],
      7,
      fixedRng()
    );
    const counts = countGroups(routine);

    expect(counts.shoulders).toBe(3);
    expect(counts.chest).toBe(3);
    expect(counts.abductors).toBe(1);
  });

  it("avoids duplicates when enough eligible exercises exist", () => {
    const routine = generateRoutine(
      exercises,
      ["shoulders", "chest"],
      [],
      6,
      fixedRng()
    );
    const uniqueIds = new Set(routine.map((exercise) => exercise.id));

    expect(uniqueIds.size).toBe(6);
  });

  it("returns an empty routine when no selected group has exercises", () => {
    expect(generateRoutine(exercises, ["core"], [], 10, fixedRng())).toEqual([]);
  });

  it("intersects group and tag filters", () => {
    const routine = generateRoutine(
      exercises,
      ["shoulders", "chest"],
      ["inventory:v2"],
      4,
      fixedRng()
    );

    expect(routine).toHaveLength(4);
    expect(
      routine.every(
        (exercise) =>
          ["shoulders", "chest"].includes(exercise.primaryGroup) &&
          exercise.tags.includes("inventory:v2")
      )
    ).toBe(true);
  });

  it("treats an empty tag list as no tag constraint", () => {
    const routine = generateRoutine(
      exercises,
      ["abductors"],
      [],
      1,
      fixedRng()
    );

    expect(routine).toHaveLength(1);
    expect(routine[0].id).toBe("abductor-1");
  });

  it("treats an empty group list as every group present", () => {
    const routine = generateRoutine(exercises, [], [], 7, fixedRng());

    expect(routine).toHaveLength(7);
    expect(new Set(routine.map((exercise) => exercise.id)).size).toBe(7);
  });

  it("returns an empty routine when no exercise carries any selected tag", () => {
    expect(
      generateRoutine(exercises, [], ["inventory:does-not-exist"], 5, fixedRng())
    ).toEqual([]);
  });

  it("excludes groups that match tags only through other exercises", () => {
    // abductor-1 is only tagged inventory:v1, so an inventory:v2 filter must
    // drop the abductors group entirely even when groups are unrestricted.
    const routine = generateRoutine(
      exercises,
      [],
      ["inventory:v2"],
      4,
      fixedRng()
    );

    expect(routine).toHaveLength(4);
    expect(routine.every((exercise) => exercise.primaryGroup !== "abductors")).toBe(
      true
    );
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
