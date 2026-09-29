import type { WorkoutPreset } from "../types";

// Built-in A/B split. Each pair covers the same area with complementary
// movement patterns, and no workout stacks two variations of one pattern.
// Lists are written warmup -> work -> peak; loading still sorts by intensity so
// a later retag of an exercise keeps the ramp intact.
export const workoutPresets: WorkoutPreset[] = [
  {
    id: "lower-core-a",
    name: "Lower + Core A",
    focus: "Squat pattern, anti-extension core",
    exerciseIds: [
      "hip-cars",
      "banded-clamshell",
      "dead-bug",
      "db-goblet-squat",
      "db-calf-raise",
      "trx-fallout",
      "copenhagen-short-lever",
      "db-bulgarian-split-squat"
    ]
  },
  {
    id: "lower-core-b",
    name: "Lower + Core B",
    focus: "Hinge pattern, anti-lateral core",
    exerciseIds: [
      "90-90-hip-switch",
      "mcgill-bird-dog",
      "db-standing-side-bend",
      "db-hip-thrust",
      "side-hyperextension",
      "db-romanian-deadlift",
      "cossack-squat",
      "ball-trx-hamstring-curl"
    ]
  },
  {
    id: "upper-a",
    name: "Upper A",
    focus: "Horizontal push, vertical pull",
    exerciseIds: [
      "wall-angels",
      "db-halo",
      "dead-hang",
      "db-floor-press",
      "trx-face-pull",
      "trx-biceps-curl",
      "db-skull-crusher",
      "pull-up"
    ]
  },
  {
    id: "upper-b",
    name: "Upper B",
    focus: "Vertical push, horizontal pull",
    exerciseIds: [
      "trx-ytw-raise",
      "scapular-push-up",
      "db-pullover",
      "trx-low-row",
      "db-lateral-raise",
      "db-hammer-curl",
      "trx-triceps-extension",
      "db-overhead-press"
    ]
  },
  {
    id: "mobility-a",
    name: "Mobility A",
    focus: "Spine and upper body",
    exerciseIds: [
      "chin-nod",
      "cat-cow",
      "thread-the-needle",
      "open-book",
      "foam-roller-tspine-extension",
      "wall-angels",
      "pump-stretch-down-dog-up-dog",
      "jefferson-curl"
    ]
  },
  {
    id: "mobility-b",
    name: "Mobility B",
    focus: "Hips and legs",
    exerciseIds: [
      "hip-cars",
      "90-90-hip-switch",
      "hip-flexor-stretch",
      "pigeon-pose",
      "hamstring-stretch",
      "butterfly-stretch",
      "cossack-squat"
    ]
  },
  {
    id: "hiit-a",
    name: "HIIT A",
    focus: "Vertical and forward",
    exerciseIds: [
      "jumping-jacks",
      "high-knees",
      "jumping-twists",
      "mountain-climbers",
      "walking-lunge",
      "burpee-no-push-up",
      "db-thruster"
    ]
  },
  {
    id: "hiit-b",
    name: "HIIT B",
    focus: "Lateral and ground-based",
    exerciseIds: [
      "hopping-shaking",
      "skater-hops",
      "plank-jacks",
      "hindu-push-up",
      "plyo-box-lateral-step-up",
      "db-swing",
      "burpee-with-push-up",
      "broad-jump"
    ]
  }
];
