import { describe, expect, it } from "vitest";
import type { Exercise, MuscleGroup } from "../types";
import { generateRoutine } from "./routine";

const exercises: Exercise[] = [
  {
    id: "shoulder-1",
    name: "Shoulder 1",
    groups: ["shoulders"],
    tags: ["inventory:v1"]
  },
  {
    id: "shoulder-2",
    name: "Shoulder 2",
    groups: ["shoulders"],
    tags: ["inventory:v2"]
  },
  {
    id: "shoulder-3",
    name: "Shoulder 3",
    groups: ["shoulders"],
    tags: ["inventory:v2"]
  },
  {
    id: "chest-1",
    name: "Chest 1",
    groups: ["chest"],
    tags: ["inventory:v1"]
  },
  {
    id: "chest-2",
    name: "Chest 2",
    groups: ["chest"],
    tags: ["inventory:v2"]
  },
  {
    id: "chest-3",
    name: "Chest 3",
    groups: ["chest"],
    tags: ["inventory:v2"]
  },
  {
    id: "abductor-1",
    name: "Abductor 1",
    groups: ["abductors"],
    tags: ["inventory:v1"]
  }
];

describe("generateRoutine", () => {
  it("only selects exercises from checked groups", () => {
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
        exercise.groups.some((g) => ["shoulders", "chest"].includes(g))
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
          exercise.groups.some((g) => ["shoulders", "chest"].includes(g)) &&
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

  it("spreads movement patterns by avoiding heavily overlapping picks", () => {
    // Two near-identical compounds plus one low-overlap isolation move, all in
    // the quads group. Without the diversity heuristic a 2-pick routine could be
    // both compounds; with it, the isolation move must make the cut.
    const pool: Exercise[] = [
      { id: "iso", name: "Iso", groups: ["quads"], tags: ["t"] },
      { id: "compound-a", name: "Compound A", groups: ["quads", "glutes", "core"], tags: ["t"] },
      { id: "compound-b", name: "Compound B", groups: ["quads", "glutes", "core"], tags: ["t"] }
    ];

    const routine = generateRoutine(pool, ["quads"], [], 2, fixedRng());

    expect(routine).toHaveLength(2);
    expect(routine.some((exercise) => exercise.id === "iso")).toBe(true);
  });

  it("ramps the routine order from warmup to peak", () => {
    const pool: Exercise[] = [
      { id: "peak-1", name: "Peak", groups: ["quads"], tags: ["t"], intensity: "peak" },
      { id: "work-1", name: "Work", groups: ["chest"], tags: ["t"] },
      { id: "warm-1", name: "Warm", groups: ["core"], tags: ["t"], intensity: "warmup" }
    ];

    const routine = generateRoutine(pool, ["quads", "chest", "core"], [], 3, fixedRng());

    expect(routine.map((exercise) => exercise.id)).toEqual(["warm-1", "work-1", "peak-1"]);
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
    expect(routine.every((exercise) => !exercise.groups.includes("abductors"))).toBe(
      true
    );
  });
});

function countGroups(routine: Exercise[]): Partial<Record<MuscleGroup, number>> {
  return routine.reduce<Partial<Record<MuscleGroup, number>>>((counts, exercise) => {
    // Count against the first (primary) group for balance checking
    const primary = exercise.groups[0];
    counts[primary] = (counts[primary] ?? 0) + 1;
    return counts;
  }, {});
}

function fixedRng(): () => number {
  return () => 0;
}
