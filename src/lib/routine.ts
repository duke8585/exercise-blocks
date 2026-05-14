import type { Exercise, MuscleGroup, RoutineExercise } from "../types";

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
              .map((exercise) => exercise.primaryGroup)
          )
        )
      : selectedGroups;

  const groups = candidateGroups.filter((group) =>
    exercises.some(
      (exercise) =>
        exercise.primaryGroup === group && matchesTags(exercise)
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
            exercise.primaryGroup === group && matchesTags(exercise)
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
        picked = candidates[Math.floor(rng() * candidates.length)];
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

  return routine;
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
