import { useEffect, useMemo, useRef, useState } from "react";
import {
  MUSCLE_GROUP_OPTIONS,
  type MuscleGroup,
  type RoutineExercise,
  type StoredAppConfig
} from "./types";
import { generateRoutine, toRoutineExercises } from "./lib/routine";
import {
  createStoredConfig,
  createExportFilename,
  defaultStoredConfig,
  formatConfigJson,
  loadStoredConfig,
  parseConfigJson,
  saveStoredConfig,
  STORAGE_KEY
} from "./lib/storage";

type TimerMode = "idle" | "sideA" | "sideB" | "resting" | "finished";

interface SessionState {
  activeIndex: number | null;
  completedIds: string[];
  mode: TimerMode;
  remaining: number;
  restSeconds: number;
}

const emptySession: SessionState = {
  activeIndex: null,
  completedIds: [],
  mode: "idle",
  remaining: 0,
  restSeconds: 0
};

const allGroups = MUSCLE_GROUP_OPTIONS.map((option) => option.id);

function collectLibraryTags(exercises: StoredAppConfig["exercises"]): string[] {
  return Array.from(
    new Set(exercises.flatMap((exercise) => exercise.tags))
  ).sort((a, b) => a.localeCompare(b));
}

export default function App() {
  const [config, setConfig] = useState<StoredAppConfig>(() => {
    if (typeof window === "undefined") {
      return defaultStoredConfig();
    }

    return loadStoredConfig(window.localStorage);
  });
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>(allGroups);
  const allTags = useMemo(() => collectLibraryTags(config.exercises), [config.exercises]);
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    collectLibraryTags(config.exercises)
  );
  const [routine, setRoutine] = useState<RoutineExercise[]>([]);
  const [session, setSession] = useState<SessionState>(emptySession);
  const [message, setMessage] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);

  const completedIds = useMemo(
    () => new Set(session.completedIds),
    [session.completedIds]
  );
  const activeExercise =
    session.activeIndex === null ? null : routine[session.activeIndex] ?? null;
  const selectedCount = selectedGroups.length;

  // Drop any selected tags that no longer exist after a library swap (e.g.
  // import or clear-storage may not have touched selectedTags directly).
  useEffect(() => {
    setSelectedTags((current) => {
      const allowed = new Set(allTags);
      const filtered = current.filter((tag) => allowed.has(tag));
      return filtered.length === current.length ? current : filtered;
    });
  }, [allTags]);

  useEffect(() => {
    saveStoredConfig(window.localStorage, config);
  }, [config]);

  useEffect(() => {
    if (!["sideA", "sideB", "resting"].includes(session.mode)) {
      return;
    }

    const interval = window.setInterval(() => {
      setSession((current) => {
        if (current.mode === "resting") {
          return {
            ...current,
            restSeconds: current.restSeconds + 1
          };
        }

        if (current.mode === "sideA") {
          if (current.remaining > 1) {
            return {
              ...current,
              remaining: current.remaining - 1
            };
          }

          playCue(1);
          return {
            ...current,
            mode: "sideB",
            remaining: config.settings.timer.sideBSeconds
          };
        }

        if (current.mode === "sideB") {
          if (current.remaining > 1) {
            return {
              ...current,
              remaining: current.remaining - 1
            };
          }

          const currentExercise =
            current.activeIndex === null ? null : routine[current.activeIndex];
          const completed = currentExercise
            ? Array.from(new Set([...current.completedIds, currentExercise.instanceId]))
            : current.completedIds;
          const nextIndex =
            current.activeIndex !== null && current.activeIndex + 1 < routine.length
              ? current.activeIndex + 1
              : null;

          playCue(2);
          return {
            activeIndex: nextIndex,
            completedIds: completed,
            mode: nextIndex === null ? "finished" : "resting",
            remaining: 0,
            restSeconds: 0
          };
        }

        return current;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [config.settings.timer.sideBSeconds, routine, session.mode]);

  function updateStoredConfig(nextConfig: StoredAppConfig) {
    setConfig(nextConfig);
  }

  function updateRoutineCount(value: number) {
    if (!Number.isFinite(value)) {
      return;
    }

    updateStoredConfig(
      createStoredConfig(config.exercises, value, config.settings.timer)
    );
  }

  function updateTimer(partialTimer: Partial<StoredAppConfig["settings"]["timer"]>) {
    if (
      (partialTimer.sideASeconds !== undefined &&
        !Number.isFinite(partialTimer.sideASeconds)) ||
      (partialTimer.sideBSeconds !== undefined &&
        !Number.isFinite(partialTimer.sideBSeconds))
    ) {
      return;
    }

    updateStoredConfig(
      createStoredConfig(config.exercises, config.settings.routineCount, {
        ...config.settings.timer,
        ...partialTimer
      })
    );
  }

  function toggleGroup(group: MuscleGroup) {
    setSelectedGroups((current) =>
      current.includes(group)
        ? current.filter((selected) => selected !== group)
        : [...current, group]
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((selected) => selected !== tag)
        : [...current, tag]
    );
  }

  function generate() {
    const nextRoutine = toRoutineExercises(
      generateRoutine(
        config.exercises,
        selectedGroups,
        selectedTags,
        config.settings.routineCount
      )
    );

    if (nextRoutine.length === 0) {
      setRoutine([]);
      setSession(emptySession);
      setMessage("No exercises match the current group and tag filters.");
      return;
    }

    setRoutine(nextRoutine);
    setSession({
      ...emptySession,
      activeIndex: 0
    });
    setMessage("");
  }

  function startActiveExercise() {
    if (!activeExercise) {
      return;
    }

    ensureAudioContext();
    setSession((current) => ({
      ...current,
      mode: "sideA",
      remaining: config.settings.timer.sideASeconds,
      restSeconds: 0
    }));
  }

  function selectExercise(index: number) {
    if (session.mode === "sideA" || session.mode === "sideB") {
      return;
    }

    setSession((current) => ({
      ...current,
      activeIndex: index,
      mode: current.mode === "finished" ? "idle" : current.mode,
      restSeconds: current.mode === "resting" ? current.restSeconds : 0
    }));
  }

  function resetSession() {
    setSession(routine.length > 0 ? { ...emptySession, activeIndex: 0 } : emptySession);
  }

  function exportJson() {
    const blob = new Blob(
      [
        formatConfigJson(config, {
          currentWorkout: routine,
          includeDocumentation: true
        })
      ],
      {
        type: "application/json"
      }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = createExportFilename();
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearStoredData() {
    const confirmed = window.confirm(
      "Clear saved library and settings, then reset to defaults? Export JSON first if you want a backup."
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    const fresh = defaultStoredConfig();
    setConfig(fresh);
    setSelectedGroups(allGroups);
    setSelectedTags(collectLibraryTags(fresh.exercises));
    setRoutine([]);
    setSession(emptySession);
    setMessage("Storage reset to defaults.");
  }

  async function importJson(file: File | null) {
    if (!file) {
      return;
    }

    const parsed = parseConfigJson(await file.text(), config);
    if (!parsed.ok) {
      setMessage(parsed.error);
      return;
    }

    const importedRoutine = parsed.currentWorkout
      ? toRoutineExercises(parsed.currentWorkout.exercises)
      : [];

    setConfig(parsed.config);
    setSelectedGroups(allGroups);
    setSelectedTags(collectLibraryTags(parsed.config.exercises));
    setRoutine(importedRoutine);
    setSession(
      importedRoutine.length > 0 ? { ...emptySession, activeIndex: 0 } : emptySession
    );
    setMessage(
      importedRoutine.length > 0
        ? "Imported library, settings, and current workout."
        : "Imported library and settings."
    );
  }

  function ensureAudioContext() {
    const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextConstructor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }

  function playCue(count: 1 | 2) {
    const context = ensureAudioContext();
    if (context) {
      for (let index = 0; index < count; index += 1) {
        const startAt = context.currentTime + index * 0.3;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.2);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.22);
      }
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(count === 1 ? 120 : [120, 80, 120]);
    }
  }

  const timerLabel =
    session.mode === "sideA"
      ? "Side A"
      : session.mode === "sideB"
        ? "Side B"
        : session.mode === "resting"
          ? "Rest"
          : session.mode === "finished"
            ? "Done"
            : "Ready";
  const timerValue =
    session.mode === "resting"
      ? formatSeconds(session.restSeconds)
      : session.mode === "sideA" || session.mode === "sideB"
        ? formatSeconds(session.remaining)
        : "--:--";
  const canStart =
    Boolean(activeExercise) &&
    session.mode !== "sideA" &&
    session.mode !== "sideB" &&
    !completedIds.has(activeExercise?.instanceId ?? "");
  const isWorkMode = session.mode === "sideA" || session.mode === "sideB";
  const timerBandClass = `timer-band ${
    isWorkMode
      ? "work"
      : session.mode === "resting"
        ? "rest"
        : session.mode === "finished"
          ? "done"
          : "ready"
  }`;
  const exercisePanelLabel = isWorkMode ? "Current" : "Next";
  const exercisePanelValue =
    session.mode === "finished"
      ? "Done"
      : activeExercise?.name ?? "No routine";

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Daily Routine</p>
          <h1>Exercise blocks</h1>
        </div>
        <button className="secondary-button" type="button" onClick={resetSession}>
          Reset
        </button>
      </header>

      <section className="panel controls-panel" aria-labelledby="settings-heading">
        <div className="section-heading">
          <h2 id="settings-heading">Settings</h2>
          <span>
            {selectedCount} groups · {selectedTags.length}/{allTags.length} tags
          </span>
        </div>

        <div className="number-grid">
          <NumberSetting
            label="Exercises"
            max={60}
            min={1}
            value={config.settings.routineCount}
            onCommit={updateRoutineCount}
          />
          <NumberSetting
            label="Side A"
            max={300}
            min={5}
            value={config.settings.timer.sideASeconds}
            onCommit={(sideASeconds) => updateTimer({ sideASeconds })}
          />
          <NumberSetting
            label="Side B"
            max={300}
            min={5}
            value={config.settings.timer.sideBSeconds}
            onCommit={(sideBSeconds) => updateTimer({ sideBSeconds })}
          />
        </div>

        <div className="filter-section">
          <div className="filter-heading">
            <h3>Muscle groups</h3>
            <div className="group-actions">
              <button type="button" onClick={() => setSelectedGroups(allGroups)}>
                All
              </button>
              <button type="button" onClick={() => setSelectedGroups([])}>
                None
              </button>
            </div>
          </div>

          <div className="group-grid" aria-label="Muscle groups">
            {MUSCLE_GROUP_OPTIONS.map((group) => (
              <label className="group-toggle" key={group.id}>
                <input
                  checked={selectedGroups.includes(group.id)}
                  type="checkbox"
                  onChange={() => toggleGroup(group.id)}
                />
                <span>{group.label}</span>
              </label>
            ))}
          </div>
        </div>

        {allTags.length > 0 ? (
          <div className="filter-section">
            <div className="filter-heading">
              <h3>Tags</h3>
              <div className="group-actions">
                <button type="button" onClick={() => setSelectedTags(allTags)}>
                  All
                </button>
                <button type="button" onClick={() => setSelectedTags([])}>
                  None
                </button>
              </div>
            </div>

            <div className="group-grid" aria-label="Tags">
              {allTags.map((tag) => (
                <label className="group-toggle" key={tag}>
                  <input
                    checked={selectedTags.includes(tag)}
                    type="checkbox"
                    onChange={() => toggleTag(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="primary-actions">
          <button className="primary-button" type="button" onClick={generate}>
            Generate routine
          </button>
          <button type="button" onClick={exportJson}>
            Export JSON
          </button>
          <label className="file-button">
            Import JSON
            <input
              accept="application/json"
              type="file"
              onChange={(event) => {
                void importJson(event.currentTarget.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button type="button" onClick={clearStoredData}>
            Clear storage
          </button>
        </div>

        {message ? <p className="message">{message}</p> : null}
      </section>

      <section className={timerBandClass} aria-live="polite">
        <div>
          <span>{timerLabel}</span>
          <strong>{timerValue}</strong>
        </div>
        <div>
          <span>{exercisePanelLabel}</span>
          <strong>{exercisePanelValue}</strong>
        </div>
        <button
          className="start-button"
          type="button"
          disabled={!canStart}
          onClick={startActiveExercise}
        >
          Start
        </button>
      </section>

      <section className="routine-section" aria-labelledby="routine-heading">
        <div className="section-heading">
          <h2 id="routine-heading">Routine</h2>
          <span>{routine.length} exercises</span>
        </div>

        {routine.length === 0 ? (
          <div className="empty-state">Generate a routine to begin.</div>
        ) : (
          <ol className="routine-list">
            {routine.map((exercise, index) => {
              const isActive = session.activeIndex === index;
              const isDone = completedIds.has(exercise.instanceId);
              const detail = exerciseDetailText(exercise);

              return (
                <li
                  className={`routine-item ${isActive ? "active" : ""} ${
                    isDone ? "done" : ""
                  }`}
                  key={exercise.instanceId}
                >
                  <div className="routine-card">
                    <button
                      className="routine-select"
                      type="button"
                      onClick={() => selectExercise(index)}
                    >
                      <span className="routine-index">{index + 1}</span>
                      <span>
                        <strong>{exercise.name}</strong>
                        <small>
                          {labelForGroup(exercise.primaryGroup)}
                          {exercise.sideMode === "leftRight" ? " · left/right" : ""}
                        </small>
                      </span>
                      <span className="state-pill">
                        {isDone ? "Done" : isActive ? "Active" : "Queued"}
                      </span>
                    </button>
                    <p className="exercise-description">{detail}</p>
                    {exercise.links && exercise.links.length > 0 ? (
                      <div className="exercise-links">
                        {exercise.links.map((link) => (
                          <a
                            href={link.url}
                            key={`${exercise.instanceId}-${link.url}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}

interface NumberSettingProps {
  label: string;
  max: number;
  min: number;
  value: number;
  onCommit: (value: number) => void;
}

function NumberSetting({ label, max, min, value, onCommit }: NumberSettingProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function handleChange(nextDraft: string) {
    setDraft(nextDraft);

    if (nextDraft.trim() === "") {
      return;
    }

    const parsed = Number(nextDraft);
    if (!Number.isFinite(parsed)) {
      return;
    }

    const integer = Math.floor(parsed);
    if (integer < min || integer > max) {
      return;
    }

    onCommit(integer);
  }

  return (
    <label>
      {label}
      <input
        inputMode="numeric"
        max={max}
        min={min}
        type="number"
        value={draft}
        onBlur={() => {
          const parsed = Number(draft);
          if (
            draft.trim() === "" ||
            !Number.isFinite(parsed) ||
            parsed < min ||
            parsed > max
          ) {
            setDraft(String(value));
          }
        }}
        onChange={(event) => handleChange(event.currentTarget.value)}
      />
    </label>
  );
}

function labelForGroup(group: MuscleGroup): string {
  return (
    MUSCLE_GROUP_OPTIONS.find((option) => option.id === group)?.label ?? group
  );
}

function exerciseDetailText(exercise: RoutineExercise): string {
  if (exercise.description) {
    return exercise.description;
  }

  if (exercise.notes) {
    return exercise.notes;
  }

  const sideHint =
    exercise.sideMode === "leftRight"
      ? "Use the first block for one side and the second block for the other."
      : "Use both timer blocks for steady, controlled work.";

  return `${labelForGroup(exercise.primaryGroup)} focus. ${sideHint}`;
}

function formatSeconds(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
