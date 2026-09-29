# Daily Routine Organizer

A minimal mobile-first exercise routine generator for GitHub Pages.

## Spec

The app helps create short exercise routines from a local exercise library. A user checks muscle groups, chooses the number of exercises, generates a random routine, and runs each item as timed left/right style blocks.

### Exercise Library

- The app ships with a seeded exercise library for testing and initial use.
- Each exercise has:
  - `id`
  - `name`
  - `primaryGroup`
  - `tags`
  - optional `sideMode`
  - optional `description`
  - optional `notes`
  - optional `links`
  - optional `videoUrl` (explicit demo video; replaces the generic YouTube search button)
- Built-in inventory tags:
  - `inventory:v0`: original exercise library
  - `inventory:v1`: cardio/HIIT additions
  - `inventory:v2`: requested warmup/mobility sequence
  - `inventory:v3`: neck/shoulder resilience set (also tagged `neck-shoulder-resilience`)
  - `inventory:v9:big-toe-pronation`: big-toe / overpronation correction drills
  - `inventory:v10:hamstring-injury`: hamstring injury rehab/prevention curls
  - `inventory:v11:flexibility-splits`: MovementbyDavid flexibility/splits stretches (with explicit videos)
  - `inventory:v13:equipment`: home-gym kit additions (TRX, adjustable dumbbells, hyperextension bench)
- Equipment tags (stackable, also applied to matching earlier exercises): `trx`, `dumbbell`, `hyper-bench`
- Supported primary muscle groups:
  - spine flexion/extension
  - glutes
  - abductors
  - adductors
  - quads
  - hamstrings
  - calves
  - core
  - shoulders
  - chest
  - back
  - biceps
  - triceps
  - cardio/HIIT

### Routine Generation

- All muscle groups are checked by default.
- The default routine length is 10 exercises.
- Only exercises whose primary group is checked are eligible.
- Random selection is weighted equally per selected muscle group, not equally per exercise.
- Duplicates are avoided when enough eligible exercises exist.
- Generated routine state is temporary and is not restored after reload.

### Timer Behavior

- Each exercise runs one work block (default 60 seconds).
- A single beep marks the halfway point for every exercise; for left/right exercises that is the side switch, and the timer label shows Side A / Side B.
- Exercise completion/rest uses a double beep, with mobile vibration where supported.
- Configs saved with the older side A / side B timer are migrated by summing both values.
- The sticky timer panel is orange/red during work blocks and green during rest.
- After an exercise completes:
  - the exercise is checked off in the current session
  - the next exercise is selected
  - an upward-counting rest timer starts
  - the next exercise does not start until the user presses Start

### Storage

The only durable app data is the exercise library, number of exercises, and timer config. `localStorage` stores `version`, `exercises`, and `settings`; JSON import/export uses those same fields and may additionally include `currentWorkout`:

```json
{
  "version": 1,
  "exercises": [
    {
      "id": "cat-cow",
      "name": "Cat cow",
      "primaryGroup": "spine_flexion_extension",
      "tags": ["inventory:v0"],
      "sideMode": "single",
      "description": "Optional paragraph shown in the routine list.",
      "notes": "Optional extra notes.",
      "links": [
        {
          "label": "Reference video",
          "url": "https://example.com"
        }
      ]
    }
  ],
  "settings": {
    "routineCount": 10,
    "timer": {
      "exerciseSeconds": 60
    }
  },
  "currentWorkout": {
    "exercises": [
      {
        "id": "cat-cow",
        "name": "Cat cow",
        "primaryGroup": "spine_flexion_extension",
        "tags": ["inventory:v0"],
        "sideMode": "single",
        "description": "Optional paragraph shown in the routine list."
      }
    ]
  }
}
```

The app does not store generated routines, selected exercise, completed checks, countdown state, or rest timer state in `localStorage`. Exported JSON can include `currentWorkout` as a portable snapshot, and importing that JSON replaces the visible workout list.

Exports include an additional `_documentation` object for humans and LLM-assisted editing. Imports ignore that documentation and load only the supported app data plus optional `currentWorkout`.

In the UI, exporting downloads the current app data and generated workout as JSON, importing writes library/settings into local storage and replaces the visible workout, and clearing storage warns first before resetting the library/settings back to defaults.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run test
npm run build
```

## GitHub Pages

The repository includes a GitHub Actions workflow that builds the Vite app and deploys the `dist` artifact to GitHub Pages on pushes to `main`.
