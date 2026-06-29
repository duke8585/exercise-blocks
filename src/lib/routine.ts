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

// Roughly what share of a routine should be warmups. The rest of the slots go to
// "everything else" (work + peak). Warmups are capped at how many distinct ones
// are eligible, so a narrow filter simply yields fewer of them.
const WARMUP_FRACTION = 1 / 3;

// Build a routine in three conceptual stages:
//
//   1. Budget — reserve ~WARMUP_FRACTION of the slots for warmup-intensity
//      moves (capped at how many distinct warmups are eligible), the rest go to
//      "everything else" (work + peak).
//   2. Draw — fill each pool with the same balanced picker: a round-robin that
//      weights equally per selected group (not per exercise), plus a diversity
//      step that avoids stacking patterns that overlap by >=2 muscle groups.
//   3. Order — concatenate then stable-sort by intensity so warmups lead as a
//      block and loaded peak movements trail.
//
// Caveat: group balance and pattern diversity are enforced *within each pool
// separately*, not across the whole routine. The warmup block and the rest
// block are each internally balanced, but a given muscle group can still surface
// once in each (e.g. a warmup and a work move that share it). This keeps the
// warmup/rest split simple and is acceptable at typical routine lengths; if
// global balance ever matters more than the 1/3 split, the two pools would need
// to share a single round-robin instead.
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

  // Compose the routine as roughly one third warmups + two thirds everything
  // else. Warmups are capped at how many distinct ones are eligible so we never
  // repeat a warmup just to hit the third; any shortfall rolls into the rest.
  const eligible = uniqueById(
    exercises.filter(
      (exercise) =>
        matchesTags(exercise) &&
        exercise.groups.some((group) => groups.includes(group))
    )
  );
  const warmupPool = eligible.filter((exercise) => exercise.intensity === "warmup");
  const restPool = eligible.filter((exercise) => exercise.intensity !== "warmup");

  const targetWarmups = Math.min(
    Math.round(targetCount * WARMUP_FRACTION),
    warmupPool.length
  );
  const warmups = selectFrom(warmupPool, groups, targetWarmups, rng, []);
  const remaining = targetCount - warmups.length;
  // If there is no non-warmup material, fall back to warmups so the routine
  // still reaches the requested length.
  const restSource = restPool.length > 0 ? restPool : warmupPool;
  const rest = selectFrom(restSource, groups, remaining, rng, warmups);

  // orderByIntensity ranks warmup < work < peak, so the warmups land up front as
  // a block and the loaded movements trail.
  return orderByIntensity([...warmups, ...rest]);
}

// Pick `count` exercises from `pool`, balanced across the selected groups present
// in the pool (equal weight per group) and steered away from redundant patterns.
// `chosenSeed` is prior picks the diversity check should also account for. Mirrors
// the round-robin used before the warmup/rest split, scoped to a subset.
function selectFrom(
  pool: Exercise[],
  groups: MuscleGroup[],
  count: number,
  rng: () => number,
  chosenSeed: Exercise[]
): Exercise[] {
  if (count <= 0 || pool.length === 0) {
    return [];
  }

  const poolGroups = groups.filter((group) =>
    pool.some((exercise) => exercise.groups.includes(group))
  );
  if (poolGroups.length === 0) {
    return [];
  }

  const exercisesByGroup = new Map<MuscleGroup, Exercise[]>();
  for (const group of poolGroups) {
    exercisesByGroup.set(
      group,
      shuffle(
        pool.filter((exercise) => exercise.groups.includes(group)),
        rng
      )
    );
  }

  const eligible = poolGroups.flatMap((group) => exercisesByGroup.get(group) ?? []);
  const usedIds = new Set<string>();
  const result: Exercise[] = [];
  let groupOrder = shuffle([...poolGroups], rng);
  let cursor = 0;

  while (result.length < count) {
    if (usedIds.size >= eligible.length) {
      usedIds.clear();
      groupOrder = shuffle([...poolGroups], rng);
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
        picked = pickLeastRedundant(candidates, [...chosenSeed, ...result], rng);
        break;
      }
    }

    if (!picked) {
      usedIds.clear();
      continue;
    }

    result.push(picked);
    usedIds.add(picked.id);
  }

  return result;
}

function uniqueById(exercises: Exercise[]): Exercise[] {
  const byId = new Map<string, Exercise>();
  for (const exercise of exercises) {
    if (!byId.has(exercise.id)) {
      byId.set(exercise.id, exercise);
    }
  }
  return Array.from(byId.values());
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
