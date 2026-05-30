import type { Exercise } from "../types";

type SeedExerciseInput = Omit<Exercise, "tags"> & { tags?: string[] };

const inventoryV0Exercises: SeedExerciseInput[] = [
  {
    id: "cat-cow",
    name: "Cat cow",
    primaryGroup: "spine_flexion_extension",
    sideMode: "single",
    description:
      "Start on hands and knees with hands under shoulders and knees under hips. Slowly round your back toward the ceiling, then reverse the motion by lowering your belly and lifting your chest. Move smoothly with your breath instead of forcing the end positions."
  },
  {
    id: "thread-the-needle",
    name: "Thread the needle",
    primaryGroup: "spine_flexion_extension",
    sideMode: "leftRight",
    description:
      "Start on hands and knees, then slide one arm under your chest and rotate your upper back toward the floor. Keep your hips mostly stacked over your knees so the motion comes from the upper spine and shoulder. Use the first block for one side and the second block for the other."
  },
  {
    id: "cobra-to-childs-pose",
    name: "Cobra to child's pose",
    primaryGroup: "spine_flexion_extension",
    sideMode: "single",
    description:
      "Lie on your stomach, press gently through your hands, and lift your chest only as far as your low back tolerates. Then push back toward child's pose and let the spine flex in the other direction. Keep the transitions slow and reduce the range if the back feels pinchy."
  },
  {
    id: "glute-bridge",
    name: "Glute bridge",
    primaryGroup: "glutes",
    sideMode: "single",
    description:
      "Lie on your back with knees bent and feet flat, roughly hip width apart. Brace lightly through your trunk, press through your heels, and lift your hips until your body forms a straight line from shoulders to knees. Pause at the top and think about squeezing the glutes rather than arching the low back."
  },
  {
    id: "single-leg-glute-bridge",
    name: "Single-leg glute bridge",
    primaryGroup: "glutes",
    sideMode: "leftRight",
    description:
      "Lie on your back with one foot planted and the other leg lifted or lightly extended. Drive through the planted heel and lift your hips without letting the pelvis twist. This is more demanding than a regular bridge, so use a smaller range if the hamstring cramps or the low back takes over."
  },
  {
    id: "quadruped-hip-extension",
    name: "Quadruped hip extension",
    primaryGroup: "glutes",
    sideMode: "leftRight",
    description:
      "Start on hands and knees with your trunk quiet and ribs gently tucked. Push one heel back and up as if stamping the ceiling, stopping before your low back arches. Keep the movement controlled and use the glute to lift the thigh rather than swinging the leg."
  },
  {
    id: "side-lying-leg-raise",
    name: "Side-lying leg raise",
    primaryGroup: "abductors",
    sideMode: "leftRight",
    description:
      "Lie on your side with the bottom leg bent for balance and the top leg long. Lift the top leg slightly behind the body line with toes angled a little down, then lower with control. Keep the pelvis stacked and avoid rolling backward to make the range look bigger."
  },
  {
    id: "standing-hip-abduction",
    name: "Standing hip abduction",
    primaryGroup: "abductors",
    sideMode: "leftRight",
    description:
      "Stand tall and hold a wall or chair if needed. Move one leg out to the side without leaning your torso in the opposite direction. Keep the toes mostly forward and use a slow return so the side hip does the work."
  },
  {
    id: "lateral-band-walk",
    name: "Lateral band walk",
    primaryGroup: "abductors",
    sideMode: "single",
    description:
      "Place a small band around the thighs, ankles, or feet depending on difficulty. Sit into a shallow athletic stance and take small steps sideways while keeping tension in the band. Keep knees tracking over toes and avoid bouncing up and down between steps."
  },
  {
    id: "side-lying-adduction",
    name: "Side-lying adduction",
    primaryGroup: "adductors",
    sideMode: "leftRight",
    description:
      "Lie on your side with the top leg crossed in front for support and the bottom leg straight. Lift the bottom leg toward the ceiling, pause briefly, and lower without dropping it. The movement is small; keep the torso still and focus on the inner thigh."
  },
  {
    id: "copenhagen-short-lever",
    name: "Short-lever Copenhagen hold",
    primaryGroup: "adductors",
    sideMode: "leftRight",
    description:
      "Set your top knee or lower thigh on a bench or sturdy chair and support yourself on your forearm. Lift your hips into a side plank and hold, keeping the body long and the bottom leg relaxed or lightly lifted. This is not beginner friendly; shorten the hold or skip it if the inner thigh or groin feels strained."
  },
  {
    id: "standing-hip-adduction",
    name: "Standing hip adduction",
    primaryGroup: "adductors",
    sideMode: "leftRight",
    description:
      "Stand tall and hold a wall or chair for balance. Move one leg across the midline of your body, then return slowly to the starting position. Keep the pelvis level and avoid twisting the trunk to pull the leg farther."
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight squat",
    primaryGroup: "quads",
    sideMode: "single",
    description:
      "Stand with feet around shoulder width and toes slightly turned out if comfortable. Sit down between your hips while keeping your chest proud and knees tracking over your toes. Use a depth you can control without the heels lifting or the low back rounding hard."
  },
  {
    id: "split-squat",
    name: "Split squat",
    primaryGroup: "quads",
    sideMode: "leftRight",
    description:
      "Stand in a staggered stance with feet far enough apart that you can lower straight down. Bend both knees and let the back knee move toward the floor while the front foot stays planted. Keep most of the work in the front leg and use support if balance limits the movement."
  },
  {
    id: "wall-sit",
    name: "Wall sit",
    primaryGroup: "quads",
    sideMode: "single",
    description:
      "Lean your back against a wall and slide down until the thighs are working hard. Keep knees roughly over ankles and press the full back into the wall without holding your breath. Adjust the height to make the hold sustainable for the whole block."
  },
  {
    id: "hamstring-walkout",
    name: "Hamstring walkout",
    primaryGroup: "hamstrings",
    sideMode: "single",
    description:
      "Start in a glute bridge with hips lifted and feet close to your body. Walk the heels away one small step at a time while keeping the hips up, then walk them back in. This can cramp the hamstrings, so move slowly and reduce the distance if needed."
  },
  {
    id: "single-leg-rdl-reach",
    name: "Single-leg RDL reach",
    primaryGroup: "hamstrings",
    sideMode: "leftRight",
    description:
      "Stand on one leg with a soft knee and hinge forward from the hip as the other leg reaches behind you. Keep your hips mostly square to the floor and your spine long. Reach only as far as you can control, then drive through the standing foot to come back up."
  },
  {
    id: "heel-dig-bridge",
    name: "Heel-dig bridge",
    primaryGroup: "hamstrings",
    sideMode: "single",
    description:
      "Lie on your back with knees bent a little more open than a normal bridge and dig your heels into the floor. Lift your hips while pulling the heels lightly back toward you without actually sliding them. You should feel the hamstrings and glutes share the work without the low back arching."
  },
  {
    id: "standing-calf-raise",
    name: "Standing calf raise",
    primaryGroup: "calves",
    sideMode: "single",
    description:
      "Stand tall with feet about hip width and hold support if balance is distracting. Rise onto the balls of your feet, pause at the top, then lower slowly until the heels touch down. Keep the ankles from rolling outward and use a full controlled range."
  },
  {
    id: "single-leg-calf-raise",
    name: "Single-leg calf raise",
    primaryGroup: "calves",
    sideMode: "leftRight",
    description:
      "Stand on one leg and hold a wall or chair so balance does not dominate the exercise. Rise onto the ball of the foot, pause briefly, and lower with control. If the range collapses, switch to both legs or use fewer reps with cleaner movement."
  },
  {
    id: "bent-knee-calf-raise",
    name: "Bent-knee calf raise",
    primaryGroup: "calves",
    sideMode: "single",
    description:
      "Stand with knees slightly bent and keep that bend as you lift your heels. This shifts more work toward the deeper calf muscles compared with straight-leg raises. Move slowly and avoid bouncing at the bottom."
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    primaryGroup: "core",
    sideMode: "single",
    description:
      "Lie on your back with knees over hips and arms reaching toward the ceiling. Brace your core so your low back does not hollow away from the floor, then slowly move opposite arm and leg away from each other. Alternate sides and make the range smaller if you cannot keep the trunk still."
  },
  {
    id: "side-plank",
    name: "Side plank",
    primaryGroup: "core",
    sideMode: "leftRight",
    description:
      "Support yourself on one forearm with elbow under shoulder and feet stacked or staggered. Lift your hips so your body forms a long line from head to feet, then hold without letting the top shoulder roll forward. Drop to the knees if the full version makes you lose position."
  },
  {
    id: "hollow-body-hold",
    name: "Hollow body hold",
    primaryGroup: "core",
    sideMode: "single",
    description:
      "Lie on your back and press your low back gently into the floor. Lift shoulders and legs only as far as you can while keeping that low-back contact. This is demanding, so bend the knees or keep arms by your sides if the full shape breaks down."
  },
  {
    id: "wall-angels",
    name: "Wall angels",
    primaryGroup: "shoulders",
    sideMode: "single",
    description:
      "Stand with your back against a wall and ribs gently down. Slide your arms up and down the wall like a snow angel while keeping the motion smooth and pain free. If wrists or elbows cannot stay on the wall, prioritize shoulder comfort over forcing contact."
  },
  {
    id: "pike-push-up",
    name: "Pike push-up",
    primaryGroup: "shoulders",
    sideMode: "single",
    description:
      "Start in a pike position with hips high and hands on the floor. Bend the elbows and lower the head toward the floor, then press back up while keeping hips high. This is harder than a regular incline press, so elevate your hands if the shoulders or neck feel overloaded."
  },
  {
    id: "shoulder-tap",
    name: "Shoulder tap",
    primaryGroup: "shoulders",
    sideMode: "single",
    description:
      "Start in a high plank with hands under shoulders and feet wide enough to control your hips. Lift one hand to tap the opposite shoulder, place it down, and alternate sides. Keep the pelvis as quiet as possible instead of rocking side to side."
  },
  {
    id: "push-up",
    name: "Push-up",
    primaryGroup: "chest",
    sideMode: "single",
    description:
      "Start in a plank with hands under or slightly wider than shoulders. Lower your chest toward the floor with elbows angled back, then press away while keeping the body in one line. Use knees or an elevated surface if the full version makes your hips sag."
  },
  {
    id: "incline-push-up",
    name: "Incline push-up",
    primaryGroup: "chest",
    sideMode: "single",
    description:
      "Place your hands on a bench, counter, or sturdy surface and step back into a straight-body plank. Lower your chest toward the surface, then press back up without shrugging the shoulders. The higher the hands, the more beginner friendly the movement becomes."
  },
  {
    id: "chest-squeeze-pulse",
    name: "Chest squeeze pulse",
    primaryGroup: "chest",
    sideMode: "single",
    description:
      "Bring your palms or forearms together in front of your chest and press them firmly into each other. Keep that squeeze while making small forward pulses or tiny lifts. Keep shoulders down and treat it as a controlled chest contraction rather than a speed drill."
  },
  {
    id: "prone-y-raise",
    name: "Prone Y raise",
    primaryGroup: "back",
    sideMode: "single",
    description:
      "Lie face down with arms overhead in a Y shape and thumbs pointing up. Lift the arms slightly off the floor by drawing the shoulder blades down and back, then lower slowly. Keep the neck long and avoid turning it into a low-back extension."
  },
  {
    id: "superman-pull",
    name: "Superman pull",
    primaryGroup: "back",
    sideMode: "single",
    description:
      "Lie face down with arms reaching forward and legs long. Lift chest and arms slightly, then pull elbows down toward your ribs as if doing a lat pulldown. Keep the range modest so the upper back works without jamming the low back."
  },
  {
    id: "reverse-snow-angel",
    name: "Reverse snow angel",
    primaryGroup: "back",
    sideMode: "single",
    description:
      "Lie face down with arms by your sides and palms facing down or slightly out. Lift the arms just off the floor and sweep them overhead, then return to the start with control. Keep the chest low if needed and focus on shoulder blade motion."
  },
  {
    id: "towel-curl",
    name: "Towel curl",
    primaryGroup: "biceps",
    sideMode: "single",
    description:
      "Hold a towel with both hands and create resistance by pulling it apart or looping it under one foot. Curl against that resistance while keeping elbows close to your sides. Make the towel tension strong enough to work but not so strong that the shoulders hike up."
  },
  {
    id: "isometric-biceps-hold",
    name: "Isometric biceps hold",
    primaryGroup: "biceps",
    sideMode: "single",
    description:
      "Bend your elbows to about 90 degrees and create resistance with a towel, band, or your opposite hand. Hold the position while breathing normally and keeping wrists straight. Increase effort gradually instead of yanking into the hold."
  },
  {
    id: "reverse-plank-curl",
    name: "Reverse plank curl",
    primaryGroup: "biceps",
    sideMode: "single",
    description:
      "Sit with hands behind you, fingers turned in a comfortable direction, and lift your hips into a reverse plank position. Bend and straighten the elbows slightly while keeping the chest open. This is shoulder-demanding, so use a small range or skip it if the front of the shoulder feels irritated."
  },
  {
    id: "bench-dip",
    name: "Bench dip",
    primaryGroup: "triceps",
    sideMode: "single",
    description:
      "Sit on the edge of a sturdy chair or bench with hands beside your hips. Move your hips forward, bend the elbows to lower, then press back up. Keep the shoulders down and use bent knees to reduce load if the movement feels too aggressive."
  },
  {
    id: "close-grip-push-up",
    name: "Close-grip push-up",
    primaryGroup: "triceps",
    sideMode: "single",
    description:
      "Set up in a push-up position with hands closer than usual but still comfortable for the wrists. Lower with elbows tracking close to the ribs, then press back up. Use an incline or knees if you cannot keep the body line stable."
  },
  {
    id: "overhead-towel-extension",
    name: "Overhead towel extension",
    primaryGroup: "triceps",
    sideMode: "single",
    description:
      "Hold a towel overhead with one hand or both hands and create gentle resistance. Bend the elbows to let the hands move behind the head, then extend back up while keeping ribs down. Keep the neck relaxed and avoid forcing the shoulders into a painful overhead position."
  }
];

const inventoryV1Exercises: Exercise[] = [
  {
    id: "burpee-with-push-up",
    name: "Burpee with push-up",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Start standing, place your hands on the floor, jump or step back into a plank, perform a push-up, then return to standing with a small jump. Keep the trunk braced in the plank and scale by stepping the feet instead of jumping. This is high intensity; skip the push-up or slow down if form breaks."
  },
  {
    id: "burpee-no-push-up",
    name: "Burpee without push-up",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Start standing, bring your hands to the floor, jump or step back to plank, then return to standing and finish with a controlled jump or reach. Keep the movement crisp without collapsing through the low back. This version keeps the conditioning feel while being less demanding than the push-up variation."
  },
  {
    id: "mountain-climbers",
    name: "Mountain climbers",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Start in a high plank with hands under shoulders and body in one long line. Drive one knee toward the chest, switch sides, and keep alternating at a speed you can control. Keep hips from bouncing high and slow down if your shoulders or low back start taking over."
  },
  {
    id: "squat-jumps",
    name: "Squat jumps",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Start with a controlled bodyweight squat, then drive through the floor into a small vertical jump. Land softly, absorb the landing through hips and knees, and reset your position before the next rep. Use regular squats instead if jumping bothers the knees, ankles, or pelvic floor."
  },
  {
    id: "jumping-jacks",
    name: "Jumping jacks",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Jump the feet out as the arms travel overhead, then jump back to the start position. Keep the ribs controlled and land quietly rather than snapping into the floor. Step one foot out at a time for a lower-impact version."
  },
  {
    id: "high-knees",
    name: "High knees",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Run in place while lifting the knees toward hip height or whatever range stays smooth. Keep your torso tall and use quick, light contacts with the floor. March instead of running if you want a lower-impact conditioning option."
  },
  {
    id: "skater-hops",
    name: "Skater hops",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Hop laterally from one foot to the other, letting the free leg travel behind you like a speed skater. Land with a soft knee and keep the knee tracking over the toes. Make the jump smaller or step side to side if balance or impact is the limiting factor."
  },
  {
    id: "plank-jacks",
    name: "Plank jacks",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v1:cardio"],
    sideMode: "single",
    description:
      "Start in a high plank and jump both feet out and in like a jumping jack. Keep hands planted, shoulders stable, and hips close to the same height throughout. Step one foot at a time if the jumping version pulls you out of plank position."
  }
];

const inventoryV2Exercises: Exercise[] = [
  {
    id: "hopping-shaking",
    name: "Hopping / Shaking",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Bounce lightly in place and let the arms, shoulders, and legs shake loose. Keep the impact small and relaxed rather than trying to jump high. Use it as a nervous-system warmup and switch to heel raises or marching if hopping is not comfortable."
  },
  {
    id: "jumping-twists",
    name: "Jumping twists",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Stand tall, make small hops, and rotate the hips and feet side to side while the chest stays relatively forward. Keep the knees soft and the twists light, especially at the start. Step instead of jumping if rotation plus impact feels too aggressive."
  },
  {
    id: "pump-stretch-down-dog-up-dog",
    name: "Pump stretch (down dog to up dog)",
    primaryGroup: "spine_flexion_extension",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Move between a down dog shape and an up dog or cobra shape with slow, continuous control. In down dog, push the floor away and lengthen through the back of the body; in up dog, open the chest without dumping into the low back. This overlaps with the cobra flow, but the down-dog position makes it a distinct full-body pump stretch."
  },
  {
    id: "hindu-push-up",
    name: "Hindu push-up",
    primaryGroup: "chest",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Start in a pike or down dog shape, then swoop the chest forward and low before finishing in an up dog-like position. Reverse or reset back to the starting shape with control. Treat this as a bonus strength flow, roughly 10 clean reps, and scale to the pump stretch if shoulders or low back object."
  },
  {
    id: "straddle",
    name: "Straddle",
    primaryGroup: "adductors",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Sit tall with legs wide in a straddle and knees pointing upward. Hinge forward from the hips or gently shift side to side without forcing the range. Keep the spine long and use hands on the floor for support so the inner thighs can relax gradually."
  },
  {
    id: "90-90-hip-switch",
    name: "90/90 hip switch",
    primaryGroup: "glutes",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "leftRight",
    description:
      "Sit with one leg in front and one leg behind, both knees bent around 90 degrees. Spend the first block on one side, then switch to the other side and keep the torso tall as you breathe into the hip. Use hands behind you for support if sitting upright is already enough stretch."
  },
  {
    id: "cossack-squat",
    name: "Cossack squat",
    primaryGroup: "adductors",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "leftRight",
    description:
      "Start in a wide stance and shift your weight toward one side, bending that knee while the other leg stays long. Keep the heel of the working side down if possible and use your hands for balance. This is different from a regular squat because the straight leg creates a strong adductor stretch."
  },
  {
    id: "windshield-wipers",
    name: "Windshield wipers",
    primaryGroup: "core",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Lie on your back with knees bent and feet lifted or planted, depending on difficulty. Rotate the legs side to side like windshield wipers while keeping the shoulders heavy on the floor. Make the range smaller if the low back lifts or the motion becomes uncontrolled."
  },
  {
    id: "seated-good-mornings",
    name: "Seated good mornings",
    primaryGroup: "hamstrings",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Sit upright on a sturdy chair or bench with feet flat and a light load held at the chest or across the shoulders. Hinge forward at the hips with a long spine until you feel the hamstrings and back work, then return to upright without rounding. The seated position removes the legs as helpers, so even a small load is plenty."
  },
  {
    id: "hyperextensions",
    name: "Hyperextensions",
    primaryGroup: "back",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Set up on a hyperextension bench or stable surface with the hips supported and feet anchored. Lower the chest with a long spine, then extend back up by driving the hips down rather than cranking through the low back. Stop at a neutral line instead of overarching, and start with body weight only."
  },
  {
    id: "standing-good-mornings",
    name: "Standing good mornings",
    primaryGroup: "hamstrings",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Stand with feet about hip width, knees softly bent, ribs stacked over hips, and a light load held at the chest or across the shoulders. Hinge from the hips while sending them back, letting the chest travel down without rounding the spine. Reverse by driving the hips forward and keep the load conservative until the pattern is automatic."
  },
  {
    id: "jefferson-curl",
    name: "Jefferson curl",
    primaryGroup: "spine_flexion_extension",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Stand on a sturdy surface holding a very light weight in both hands, with softly bent knees. Slowly curl down one segment at a time, letting the spine fully round, then reverse from the pelvis upward to restack the spine. Treat this as controlled spinal flexion mobility, not a heavy lift, and ramp the load up only when the pattern is clean."
  },
  {
    id: "copenhagen-plank",
    name: "Copenhagen plank",
    primaryGroup: "adductors",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "leftRight",
    description:
      "Set the top leg's inner foot or shin on a bench so the inner thigh is loaded, prop yourself on the bottom forearm, and let the bottom leg hover just above the floor. Lift the hips into a side plank and hold while keeping the body long. This is the long-lever Copenhagen and it is demanding; drop to the short-lever hold or shorten the block if the adductor starts to grip."
  },
  {
    id: "banded-torso-rotations-standing",
    name: "Banded torso rotations, standing",
    primaryGroup: "core",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "leftRight",
    description:
      "Anchor a band at chest height, stand sideways to the anchor, and hold the band with both hands at chest level with arms long. Rotate the trunk away from the anchor while keeping the hips relatively quiet, then return slowly under control. Use the first block for one side and the second block for the other, and keep the band tension light enough that the spine stays long."
  },
  {
    id: "sumo-squat",
    name: "Sumo squat",
    primaryGroup: "adductors",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Stand with feet wider than shoulders and toes turned out, hands together at the chest or holding a light weight. Sit straight down between your hips while keeping the knees tracking over the toes, then drive up through the floor. The wide stance loads the inner thighs and glutes more than a regular squat; stop the depth before the heels lift or the pelvis tucks under hard."
  },
  {
    id: "nordic-curls",
    name: "Nordic curls",
    primaryGroup: "hamstrings",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Kneel on a padded surface with feet anchored under a support and hips and torso stacked in one line. Lower yourself forward by resisting through the hamstrings until you can no longer hold the line, then catch on your hands and push back up. This is brutally hard; use a band, raised hands, or a partial range until the lowering phase is controlled."
  },
  {
    id: "reverse-nordics",
    name: "Reverse Nordics",
    primaryGroup: "quads",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "single",
    description:
      "Kneel tall with feet behind you, hips stacked over knees, and torso long. Lean backward by hinging at the knees while keeping a straight line from knees to head, then return to upright. Use a smaller range or place a hand on the floor behind you for support until the quads can manage the lean without the low back arching."
  },
  {
    id: "single-leg-deadlift",
    name: "Single-leg deadlift",
    primaryGroup: "hamstrings",
    tags: ["inventory:v2:daily-practice"],
    sideMode: "leftRight",
    description:
      "Stand on one leg with a soft knee and the other leg lightly trailing or hovering. Hinge at the standing hip while the trailing leg counterbalances behind you, letting a light weight in the opposite hand travel toward the floor. Reverse by driving the standing heel down, and keep the standing-side hip from collapsing inward."
  }
];

const inventoryV3Exercises: Exercise[] = [
  {
    id: "suitcase-carry",
    name: "Suitcase carry",
    primaryGroup: "core",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "leftRight",
    description:
      "Hold a moderately heavy kettlebell in one hand and stand tall with the shoulder packed down and ribs stacked over hips. Walk slowly while resisting the urge to lean toward the loaded side, keeping the trunk quiet so the obliques and side hip do the anti-tilt work. This is the most direct rehearsal for carrying a bag without dumping the load into the neck."
  },
  {
    id: "suitcase-deadlift",
    name: "Suitcase deadlift",
    primaryGroup: "core",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "leftRight",
    description:
      "Stand with a kettlebell on the floor next to one foot and hinge at the hips to pick it up with one hand. Keep both hip points facing forward and don't let the loaded side tip down or the spine side-bend. Stand fully tall before lowering with control; the lift is about resisting the asymmetry, not moving big weight."
  },
  {
    id: "prone-t-raise",
    name: "Prone T raise",
    primaryGroup: "back",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Lie face down with arms out to the sides in a T and thumbs pointing up. Lift the arms only as high as the shoulder blades can pull them back, without shrugging or arching the low back. Squeeze between the shoulder blades and keep the neck long; this targets the mid trap and rhomboids."
  },
  {
    id: "prone-w-raise",
    name: "Prone W raise",
    primaryGroup: "back",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Lie face down with elbows bent and arms in a W, palms facing the floor. Pull the elbows back and down so the shoulder blades retract and slightly depress, ending with the upper arms close to the ribs. Keep the chest down and the neck long instead of lifting off the floor through low back extension."
  },
  {
    id: "scapular-pull-up",
    name: "Scapular pull-up",
    primaryGroup: "back",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Hang from a bar or rings with arms straight and shoulders relaxed up by the ears. Without bending the elbows, pull the shoulder blades down and back so the body rises a few centimetres. Pause briefly at the top and lower under control; this trains the lats and lower traps to anchor the shoulder rather than letting the neck carry the hang."
  },
  {
    id: "band-face-pull-external-rotation",
    name: "Band face pull with external rotation",
    primaryGroup: "shoulders",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Anchor a band at face height and grip it with both hands, palms facing down. Pull the hands toward your face while rotating the forearms up so the knuckles end up pointing at the ceiling and the elbows stay high. Keep the upper traps quiet; the rear delts and external rotators should do the pulling, not the shrug muscles."
  },
  {
    id: "chin-nod",
    name: "Chin nod",
    primaryGroup: "spine_flexion_extension",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Lie on your back with the head resting on the floor and look at the ceiling. Without lifting the head, gently nod the chin toward the throat as if tucking a small double chin, then release. The motion is tiny; the goal is to wake up the deep neck flexors so the SCM and scalenes stop overworking, not to crunch the neck."
  },
  {
    id: "open-book",
    name: "Open book",
    primaryGroup: "spine_flexion_extension",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "leftRight",
    description:
      "Lie on one side with knees stacked and bent at 90 degrees, arms reaching out in front at shoulder height. Keeping the knees pinned together, rotate the top arm and chest open toward the floor behind you, then return slowly. Move with the breath and let the rotation come from the upper back rather than yanking with the arm."
  },
  {
    id: "foam-roller-tspine-extension",
    name: "Foam roller t-spine extension",
    primaryGroup: "spine_flexion_extension",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Place a foam roller across the upper back just below the shoulder blades and lie back over it with hands supporting the head. Let the upper back extend over the roller without flaring the ribs or arching from the low back. Move the roller up an inch at a time to find stiff spots and skip ranges that pinch."
  },
  {
    id: "scapular-push-up",
    name: "Scapular push-up",
    primaryGroup: "shoulders",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Start in a high plank with hands under shoulders, body in a straight line and arms locked. Without bending the elbows, let the shoulder blades sink together between them, then press the floor away so the upper back rounds and the shoulder blades wrap around the rib cage. The arms stay straight throughout; the motion is small and trains the serratus anterior to anchor the scapula so the upper trap stops doing its job."
  },
  {
    id: "dead-hang",
    name: "Dead hang",
    primaryGroup: "back",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Hang from a pull-up bar with both hands at shoulder width, arms straight and feet off the ground. Gently pull the shoulder blades down and back without bending the arms so the shoulders feel packed rather than shrugged up toward the ears, and breathe normally. This decompresses the cervical spine, trains the lats and lower traps to anchor the shoulder, and builds grip endurance as a side effect."
  },
  {
    id: "weighted-y-raise-hyper-bench",
    name: "Weighted Y raise on hyperextension bench",
    primaryGroup: "back",
    tags: ["inventory:v3:neck-shoulder"],
    sideMode: "single",
    description:
      "Set up face down on a 45-degree hyperextension bench with the hips supported and a light dumbbell in each hand. Let the arms hang in a Y with thumbs up, then lift them by pulling the shoulder blades down and back, ending with the arms roughly in line with the body. Move slowly, drive the motion from the lower trap rather than swinging, and start very light - 2 to 5 kg is plenty before form breaks."
  }
];

const inventoryV4Exercises: Exercise[] = [
  {
    id: "plyo-box-step-up",
    name: "Plyo box step-up",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v4:step-ups"],
    sideMode: "leftRight",
    description:
      "Stand facing the box and step one foot onto it, then drive through that heel to stand fully upright on top before stepping back down. Alternate the leading leg each rep or use the first block for one side and the second for the other. Choose a box height where the hip and knee are around 90 degrees at the bottom of the step; higher is harder on the glutes, lower shifts it toward cardio conditioning."
  },
  {
    id: "plyo-box-step-up-knee-drive",
    name: "Plyo box step-up with knee drive",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v4:step-ups"],
    sideMode: "leftRight",
    description:
      "Step one foot onto the box and as you drive up through that heel, continue the motion by pulling the opposite knee up toward the chest at the top. Lower back down with control before the next rep. The knee drive turns a strength step-up into a more athletic, rhythmic movement and briefly challenges single-leg balance on each rep."
  },
  {
    id: "plyo-box-lateral-step-up",
    name: "Plyo box lateral step-up",
    primaryGroup: "cardio_hiit",
    tags: ["inventory:v4:step-ups"],
    sideMode: "leftRight",
    description:
      "Stand beside the box and step the near foot onto it sideways, then press through that foot to bring the other leg up or just stand tall on top before stepping back down. This angle loads the glutes and abductors more than a forward step-up and tends to feel less quad-dominant. Keep the knee of the working leg tracking over the toes rather than caving inward as you push up."
  }
];

// Existing entries that should also live under inventory:v2. We add the tag
// instead of duplicating the entry, so the original description and side mode
// stay authoritative.
const inventoryV2RetagIds: readonly string[] = [
  "copenhagen-short-lever", // matches "copenhagen plank" (short-lever variant)
  "single-leg-rdl-reach" // matches "single legged RDL"
];

// Existing entries that also belong to the neck/shoulder resilience set. They
// are the same movements already seeded in v0, so we retag rather than duplicate
// and keep the original descriptions authoritative.
const inventoryV3RetagIds: readonly string[] = [
  "side-plank",
  "prone-y-raise"
];

export const seedExercises: Exercise[] = applyRetags(
  applyRetags(
    consolidateExercises([
      ...inventoryV0Exercises.map((exercise) => addInventoryTag(exercise, "inventory:v0:fundamentals")),
      ...inventoryV1Exercises,
      ...inventoryV2Exercises,
      ...inventoryV3Exercises,
      ...inventoryV4Exercises
    ]),
    inventoryV2RetagIds,
    ["inventory:v2:daily-practice"]
  ),
  inventoryV3RetagIds,
  ["inventory:v3:neck-shoulder"]
);

function applyRetags(
  exercises: Exercise[],
  ids: readonly string[],
  tags: readonly string[]
): Exercise[] {
  const idSet = new Set(ids);
  const addedTags = [...tags];
  return exercises.map((exercise) =>
    idSet.has(exercise.id)
      ? { ...exercise, tags: mergeTags(exercise.tags, addedTags) }
      : exercise
  );
}

function addInventoryTag(exercise: SeedExerciseInput, tag: string): Exercise {
  return {
    ...exercise,
    tags: mergeTags(exercise.tags, [tag])
  };
}

function consolidateExercises(exercises: Exercise[]): Exercise[] {
  const byId = new Map<string, Exercise>();

  for (const exercise of exercises) {
    const existing = byId.get(exercise.id);
    if (!existing) {
      byId.set(exercise.id, exercise);
      continue;
    }

    byId.set(exercise.id, {
      ...existing,
      ...exercise,
      tags: mergeTags(existing.tags, exercise.tags),
      links: mergeLinks(existing.links, exercise.links)
    });
  }

  return Array.from(byId.values());
}

function mergeTags(...tagLists: Array<string[] | undefined>): string[] {
  return Array.from(
    new Set(
      tagLists
        .flatMap((tags) => tags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function mergeLinks(
  existingLinks: Exercise["links"],
  nextLinks: Exercise["links"]
): Exercise["links"] {
  const linksByUrl = new Map(
    [...(existingLinks ?? []), ...(nextLinks ?? [])].map((link) => [link.url, link])
  );
  return linksByUrl.size > 0 ? Array.from(linksByUrl.values()) : undefined;
}
