import { describe, expect, it } from "vitest";
import { seedExercises } from "../data/seedExercises";
import {
  createExportFilename,
  createStoredConfig,
  defaultStoredConfig,
  formatConfigJson,
  loadStoredConfig,
  parseConfigJson
} from "./storage";

describe("storage config", () => {
  it("round trips the exercise library, routine count, and timer config", () => {
    const config = createStoredConfig(
      [
        {
          ...seedExercises[0],
          description: "Move smoothly through the spine.",
          links: [{ label: "Reference", url: "https://example.com/cat-cow" }]
        },
        seedExercises[1]
      ],
      8,
      {
        sideASeconds: 25,
        sideBSeconds: 35
      }
    );
    const parsed = parseConfigJson(formatConfigJson(config));

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.config.exercises).toHaveLength(2);
      expect(parsed.config.exercises[0]).toMatchObject({
        description: "Move smoothly through the spine.",
        links: [{ label: "Reference", url: "https://example.com/cat-cow" }]
      });
      expect(parsed.config.settings.routineCount).toBe(8);
      expect(parsed.config.settings.timer).toEqual({
        sideASeconds: 25,
        sideBSeconds: 35
      });
      expect(parsed.config).not.toHaveProperty("routine");
      expect(parsed.config).not.toHaveProperty("progress");
    }
  });

  it("reports malformed JSON without replacing config", () => {
    const parsed = parseConfigJson("{not json");

    expect(parsed.ok).toBe(false);
  });

  it("uses fallback values for missing fields", () => {
    const fallback = defaultStoredConfig();
    const parsed = parseConfigJson(
      JSON.stringify({
        version: 1,
        exercises: [
          {
            id: "custom",
            name: "Custom move",
            primaryGroup: "core"
          }
        ],
        settings: {}
      }),
      fallback
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.config.exercises).toEqual([
        {
          id: "custom",
          name: "Custom move",
          groups: ["core"],
          tags: ["inventory:custom"]
        }
      ]);
      expect(parsed.config.settings).toEqual(fallback.settings);
    }
  });

  it("adds documentation metadata to exported JSON when requested", () => {
    const exported = JSON.parse(
      formatConfigJson(defaultStoredConfig(), { includeDocumentation: true })
    );

    expect(exported._documentation).toMatchObject({
      purpose: expect.stringContaining("Daily Routine Organizer"),
      notStored: expect.stringContaining("Generated routines")
    });
    expect(exported.version).toBe(1);
  });

  it("exports and imports the current workout snapshot", () => {
    const config = defaultStoredConfig();
    const exported = formatConfigJson(config, {
      currentWorkout: [seedExercises[0], seedExercises[0], seedExercises[1]],
      includeDocumentation: true
    });
    const parsed = parseConfigJson(exported);

    expect(JSON.parse(exported).currentWorkout.exercises).toHaveLength(3);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.currentWorkout?.exercises.map((exercise) => exercise.id)).toEqual([
        "cat-cow",
        "cat-cow",
        "thread-the-needle"
      ]);
      expect(parsed.config).not.toHaveProperty("currentWorkout");
    }
  });

  it("does not include a workout snapshot in plain stored config JSON", () => {
    const stored = JSON.parse(formatConfigJson(defaultStoredConfig()));

    expect(stored).not.toHaveProperty("currentWorkout");
    expect(stored).not.toHaveProperty("_documentation");
  });

  it("adds missing built-in inventory when loading older localStorage", () => {
    const oldStoredConfig = formatConfigJson(
      createStoredConfig([seedExercises[0]], 10, {
        sideASeconds: 30,
        sideBSeconds: 30
      })
    );
    const config = loadStoredConfig({
      getItem: () => oldStoredConfig
    });

    expect(config.exercises.length).toBeGreaterThan(1);
    expect(
      config.exercises.some(
        (exercise) =>
          exercise.id === "windshield-wipers" &&
          exercise.tags.includes("inventory:v2:daily-practice")
      )
    ).toBe(true);
  });

  it("creates timestamped export filenames", () => {
    expect(createExportFilename(new Date(2026, 4, 14, 9, 8, 7))).toBe(
      "daily-routine-organizer_2026-05-14_090807.json"
    );
  });
});
