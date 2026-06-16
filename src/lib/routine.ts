import type { Exercise, Intensity, MuscleGroup, RoutineExercise } from "../types";

// Order in which a generated routine ramps up. Untagged exercises default to
// "work" so only the extremes need a value in the library.
const INTENSITY_RANK: Record<Intensity, number> = {
  warmup: 0,
  work: 1,
  peak: 2
};

// Two exercises count as redundant when they share at least this many muscle
// groups. Used to steer the picker away from, e.g., five squat-pattern moves in
// one routine without touching group balance.
const REDUNDANT_GROUP_OVERLAP = 2;

export function generateRoutine(
  exercises: Exercise[],
  selectedGroups: MuscleGroup[],
  selectedTags: string[],
  count: number,
  rng: () => number = Math.random
): Exercise[] {
  const targetCount = Math.max(0, Math.floor(count));
  if (targetCount === 0) {
    return [];
  }

  // Empty tag list means no tag constraint; otherwise an exercise must carry
  // at least one selected tag. Group and tag filters combine as an
  // intersection (AND).
  const tagSet = new Set(selectedTags);
  const matchesTags = (exercise: Exercise): boolean =>
    tagSet.size === 0 || exercise.tags.some((tag) => tagSet.has(tag));

  // Empty group list means no group constraint; fall back to every group
  // present in the tag-filtered library.
  const candidateGroups: MuscleGroup[] =
    selectedGroups.length === 0
      ? Array.from(
          new Set(
            exercises
              .filter((exercise) => matchesTags(exercise))
              .flatMap((exercise) => exercise.groups)
          )
        )
      : selectedGroups;

  const groups = candidateGroups.filter((group) =>
    exercises.some(
      (exercise) =>
        exercise.groups.includes(group) && matchesTags(exercise)
    )
  );

  if (groups.length === 0) {
    return [];
  }

  const exercisesByGroup = new Map<MuscleGroup, Exercise[]>();
  for (const group of groups) {
    exercisesByGroup.set(
      group,
      shuffle(
        exercises.filter(
          (exercise) =>
            exercise.groups.includes(group) && matchesTags(exercise)
        ),
        rng
      )
    );
  }

  const eligible = groups.flatMap((group) => exercisesByGroup.get(group) ?? []);
  const usedIds = new Set<string>();
  const routine: Exercise[] = [];
  let groupOrder = shuffle([...groups], rng);
  let cursor = 0;

  while (routine.length < targetCount) {
    if (usedIds.size >= eligible.length) {
      usedIds.clear();
      groupOrder = shuffle([...groups], rng);
      cursor = 0;
    }

    let picked: Exercise | undefined;
    for (let attempts = 0; attempts < groupOrder.length; attempts += 1) {
      const group = groupOrder[cursor % groupOrder.length];
      cursor += 1;

      const candidates = (exercisesByGroup.get(group) ?? []).filter(
        (exercise) => !usedIds.has(exercise.id)
      );

      if (candidates.length > 0) {
        picked = pickLeastRedundant(candidates, routine, rng);
        break;
      }
    }

    if (!picked) {
      usedIds.clear();
      continue;
    }

    routine.push(picked);
    usedIds.add(picked.id);
  }

  return orderByIntensity(routine);
}

// Among the eligible candidates for a group, prefer the ones that overlap the
// fewest already-chosen exercises by muscle group, then pick randomly among
// that least-redundant set. This keeps group balance intact (the group was
// already chosen by the round-robin) while spreading movement patterns so a
// routine does not stack near-identical compounds.
function pickLeastRedundant(
  candidates: Exercise[],
  chosen: Exercise[],
  rng: () => number
): Exercise {
  let lowestPenalty = Infinity;
  const penalties = candidates.map((candidate) => {
    const penalty = chosen.reduce(
      (sum, picked) =>
        sum + (sharedGroupCount(candidate, picked) >= REDUNDANT_GROUP_OVERLAP ? 1 : 0),
      0
    );
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
    }
    return penalty;
  });

  const leastRedundant = candidates.filter(
    (_, index) => penalties[index] === lowestPenalty
  );
  return leastRedundant[Math.floor(rng() * leastRedundant.length)];
}

function sharedGroupCount(a: Exercise, b: Exercise): number {
  const groups = new Set(b.groups);
  return a.groups.reduce((count, group) => count + (groups.has(group) ? 1 : 0), 0);
}

// Stable sort that ramps the routine from warmup to peak. Array.prototype.sort
// is stable, so exercises of equal intensity keep their generated order.
function orderByIntensity(routine: Exercise[]): Exercise[] {
  return [...routine].sort(
    (a, b) => INTENSITY_RANK[a.intensity ?? "work"] - INTENSITY_RANK[b.intensity ?? "work"]
  );
}

export function toRoutineExercises(exercises: Exercise[]): RoutineExercise[] {
  return exercises.map((exercise, index) => ({
    ...exercise,
    instanceId: `${exercise.id}-${index}`
  }));
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index]
    ];
  }
  return shuffled;
}
