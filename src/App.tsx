import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  MUSCLE_GROUP_OPTIONS,
  type Exercise,
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
  paused: boolean;
}

const emptySession: SessionState = {
  activeIndex: null,
  completedIds: [],
  mode: "idle",
  remaining: 0,
  restSeconds: 0,
  paused: false
};

const allGroups = MUSCLE_GROUP_OPTIONS.map((option) => option.id);
const SWIPE_COMPLETE_THRESHOLD = 90;
// Matches .routine-list's CSS `gap`, so the slide-to-make-room animation
// closes/opens the exact same space the dragged card actually occupies.
const ROUTINE_LIST_GAP = 8;

interface ReorderSnapshotItem {
  id: string;
  documentTop: number;
  height: number;
}

function collectLibraryTags(exercises: StoredAppConfig["exercises"]): string[] {
  return Array.from(
    new Set(exercises.flatMap((exercise) => exercise.tags))
  ).sort((a, b) => a.localeCompare(b));
}

function findNextQueuedIndex(
  list: RoutineExercise[],
  completedIds: Iterable<string>,
  fromIndex: number
): number | null {
  const completed = new Set(completedIds);
  for (let index = fromIndex; index < list.length; index += 1) {
    if (!completed.has(list[index].instanceId)) {
      return index;
    }
  }
  return null;
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
  const [starredOnly, setStarredOnly] = useState(false);
  const starredIds = useMemo(() => new Set(config.starredIds), [config.starredIds]);
  const [routine, setRoutine] = useState<RoutineExercise[]>([]);
  const [routineHistory, setRoutineHistory] = useState<RoutineExercise[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [session, setSession] = useState<SessionState>(emptySession);
  const [message, setMessage] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioOutputRef = useRef<HTMLAudioElement | null>(null);
  const routineItemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [drag, setDrag] = useState<
    { index: number; startX: number; startY: number; deltaX: number; deltaY: number } | null
  >(null);
  const suppressNextClickRef = useRef(false);
  const [reorderDrag, setReorderDrag] = useState<{
    id: string;
    startY: number;
    startScrollY: number;
    offsetY: number;
    insertionIndex: number;
    snapshot: ReorderSnapshotItem[];
  } | null>(null);
  const reorderPointerYRef = useRef(0);

  const completedIds = useMemo(
    () => new Set(session.completedIds),
    [session.completedIds]
  );
  const activeExercise =
    session.activeIndex === null ? null : routine[session.activeIndex] ?? null;
  const selectedCount = selectedGroups.length;

  // Position of the dragged card in the pre-drag order, and its height, used
  // below to figure out which other cards should slide out of the way to
  // open a gap at the insertion point.
  const reorderOriginalIndex = reorderDrag
    ? reorderDrag.snapshot.findIndex((item) => item.id === reorderDrag.id)
    : -1;
  const reorderDraggedSpan =
    reorderDrag && reorderOriginalIndex !== -1
      ? reorderDrag.snapshot[reorderOriginalIndex].height + ROUTINE_LIST_GAP
      : 0;

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

  // Trim the ref array when the routine shrinks so stale refs don't linger.
  useEffect(() => {
    routineItemRefs.current.length = routine.length;
  }, [routine.length]);

  // Auto-scroll the active routine item into view whenever the active index
  // changes or a new routine is generated. `scrollIntoView` is a no-op when
  // the target is already visible, so this self-disables on desktop viewports
  // big enough to show the whole list.
  useEffect(() => {
    if (session.activeIndex === null) {
      return;
    }

    const node = routineItemRefs.current[session.activeIndex];
    if (!node) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    node.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center"
    });
  }, [session.activeIndex, routine]);

  // Auto-scroll the page while a card-reorder drag is held near the top or
  // bottom edge of the viewport, so a card can be dragged past whatever
  // happens to be on-screen right now.
  useEffect(() => {
    if (!reorderDrag) {
      return;
    }

    const EDGE = 72;
    const MAX_SPEED = 16;
    let rafId: number;

    function tick() {
      const y = reorderPointerYRef.current;
      const viewportHeight = window.innerHeight;
      let dy = 0;
      if (y < EDGE) {
        dy = -MAX_SPEED * Math.min(1, 1 - y / EDGE);
      } else if (y > viewportHeight - EDGE) {
        dy = MAX_SPEED * Math.min(1, 1 - (viewportHeight - y) / EDGE);
      }

      if (dy !== 0) {
        window.scrollBy(0, dy);
        updateReorderTargeting(y);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reorderDrag !== null]);

  useEffect(() => {
    if (!["sideA", "sideB", "resting"].includes(session.mode)) {
      return;
    }

    const interval = window.setInterval(() => {
      setSession((current) => {
        if (current.paused) {
          return current;
        }

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
            current.activeIndex !== null
              ? findNextQueuedIndex(routine, completed, current.activeIndex + 1)
              : null;

          playCue(2);
          return {
            activeIndex: nextIndex,
            completedIds: completed,
            mode: nextIndex === null ? "finished" : "resting",
            remaining: 0,
            restSeconds: 0,
            paused: false
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

  function toggleStar(id: string) {
    setConfig((current) => ({
      ...current,
      starredIds: current.starredIds.includes(id)
        ? current.starredIds.filter((sid) => sid !== id)
        : [...current.starredIds, id]
    }));
  }

  function generate() {
    const eligible = starredOnly
      ? config.exercises.filter((e) => starredIds.has(e.id))
      : config.exercises;
    const nextRoutine = toRoutineExercises(
      generateRoutine(
        eligible,
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

    setRoutineHistory((prev) => [...prev.slice(0, historyIndex + 1), nextRoutine]);
    setHistoryIndex((prev) => prev + 1);
    setRoutine(nextRoutine);
    setSession({ ...emptySession, activeIndex: 0 });
    setMessage("");
  }

  function goToHistoryIndex(index: number) {
    const target = routineHistory[index];
    if (!target) return;
    setHistoryIndex(index);
    setRoutine(target);
    setSession(target.length > 0 ? { ...emptySession, activeIndex: 0 } : emptySession);
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
      restSeconds: 0,
      paused: false
    }));
  }

  function stopActiveExercise() {
    setSession((current) => ({
      ...current,
      completedIds: [],
      mode: "idle",
      remaining: 0,
      paused: false
    }));
  }

  function togglePause() {
    setSession((current) => ({ ...current, paused: !current.paused }));
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

  function completeExercise(index: number) {
    const exercise = routine[index];
    if (!exercise) {
      return;
    }

    let advanced = false;
    setSession((current) => {
      const completed = Array.from(
        new Set([...current.completedIds, exercise.instanceId])
      );

      if (current.activeIndex !== index) {
        return { ...current, completedIds: completed };
      }

      advanced = true;
      const nextIndex = findNextQueuedIndex(routine, completed, index + 1);
      return {
        activeIndex: nextIndex,
        completedIds: completed,
        mode: nextIndex === null ? "finished" : "resting",
        remaining: 0,
        restSeconds: 0,
        paused: false
      };
    });

    if (advanced) {
      playCue(2);
    }
  }

  function captureReorderSnapshot(): ReorderSnapshotItem[] {
    const scrollY = window.scrollY;
    return routine.map((exercise, index) => {
      const rect = routineItemRefs.current[index]?.getBoundingClientRect();
      return {
        id: exercise.instanceId,
        documentTop: (rect?.top ?? 0) + scrollY,
        height: rect?.height ?? 0
      };
    });
  }

  // Counts how many other cards' midpoints sit above pointerY, i.e. how many
  // of them the dragged card should land after. Uses a snapshot of positions
  // taken at drag-start (in document coordinates, so it stays valid through
  // auto-scroll) rather than re-measuring live rects - the other cards are
  // now animated out of the way mid-drag, so their live rects no longer
  // reflect their original slot and would throw the calculation off.
  function computeInsertionIndex(
    snapshot: ReorderSnapshotItem[],
    draggedId: string,
    documentPointerY: number
  ): number {
    let insertionIndex = 0;
    let settled = false;

    for (const item of snapshot) {
      if (item.id === draggedId) {
        continue;
      }

      if (settled) {
        continue;
      }

      if (documentPointerY < item.documentTop + item.height / 2) {
        settled = true;
        continue;
      }

      insertionIndex += 1;
    }

    return insertionIndex;
  }

  function handleReorderHandlePointerDown(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const snapshot = captureReorderSnapshot();
    setReorderDrag({
      id,
      startY: event.clientY,
      startScrollY: window.scrollY,
      offsetY: 0,
      insertionIndex: snapshot.findIndex((item) => item.id === id),
      snapshot
    });
  }

  function updateReorderTargeting(pointerY: number) {
    const documentPointerY = pointerY + window.scrollY;
    setReorderDrag((current) => {
      if (!current) {
        return current;
      }

      // The dragged card is still normally laid out (only translated), so it
      // scrolls with the page like everything else. Auto-scroll during the
      // drag needs an extra correction term here so the card stays glued to
      // the pointer's on-screen position instead of drifting as the page
      // scrolls out from under it.
      const scrollDelta = window.scrollY - current.startScrollY;
      return {
        ...current,
        offsetY: pointerY - current.startY + scrollDelta,
        insertionIndex: computeInsertionIndex(current.snapshot, current.id, documentPointerY)
      };
    });
  }

  function handleReorderHandlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    reorderPointerYRef.current = event.clientY;
    updateReorderTargeting(event.clientY);
  }

  function commitReorder(id: string, insertionIndex: number) {
    const draggedItem = routine.find((exercise) => exercise.instanceId === id);
    if (!draggedItem) {
      return;
    }

    const activeInstanceId =
      session.activeIndex === null ? null : routine[session.activeIndex]?.instanceId ?? null;

    const reordered = routine.filter((exercise) => exercise.instanceId !== id);
    reordered.splice(insertionIndex, 0, draggedItem);

    if (reordered.every((exercise, index) => exercise.instanceId === routine[index]?.instanceId)) {
      return;
    }

    setRoutine(reordered);
    setRoutineHistory((current) => {
      if (historyIndex < 0 || !current[historyIndex]) {
        return current;
      }
      const next = [...current];
      next[historyIndex] = reordered;
      return next;
    });

    if (activeInstanceId !== null) {
      const newActiveIndex = reordered.findIndex(
        (exercise) => exercise.instanceId === activeInstanceId
      );
      setSession((current) => ({
        ...current,
        activeIndex: newActiveIndex === -1 ? current.activeIndex : newActiveIndex
      }));
    }
  }

  function handleReorderHandlePointerUp() {
    setReorderDrag((current) => {
      if (!current) {
        return null;
      }

      commitReorder(current.id, current.insertionIndex);
      return null;
    });
  }

  function handleCardPointerDown(event: PointerEvent<HTMLDivElement>, index: number) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    // Leave links and the star button alone entirely - no capture, no drag
    // tracking - so they keep their native click behavior untouched.
    if (
      event.target instanceof HTMLElement &&
      event.target.closest(".exercise-links, .star-button")
    ) {
      return;
    }

    // Pointer capture keeps move/up events targeting this card even if the
    // finger/cursor drifts outside its bounds mid-swipe. It also retargets
    // the resulting compatibility "click" event onto this element instead of
    // the nested <button>, so tap-to-select can't rely on the button's
    // onClick firing once a drag has started here - handlePointerUp below
    // drives selection directly instead.
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, startX: event.clientX, startY: event.clientY, deltaX: 0, deltaY: 0 });
  }

  function handleCardPointerMove(event: PointerEvent<HTMLDivElement>, index: number) {
    setDrag((current) => {
      if (!current || current.index !== index) {
        return current;
      }

      const deltaX = event.clientX - current.startX;
      const deltaY = event.clientY - current.startY;
      if (Math.abs(deltaY) > Math.abs(deltaX) + 10) {
        return null;
      }

      return { ...current, deltaX, deltaY };
    });
  }

  function handleCardPointerUp(index: number) {
    setDrag((current) => {
      if (!current || current.index !== index) {
        return null;
      }

      suppressNextClickRef.current = true;
      if (Math.abs(current.deltaX) > SWIPE_COMPLETE_THRESHOLD) {
        completeExercise(index);
      } else if (Math.max(Math.abs(current.deltaX), Math.abs(current.deltaY)) < 8) {
        selectExercise(index);
      }

      return null;
    });
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
    setRoutineHistory([]);
    setHistoryIndex(-1);
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
    setRoutineHistory(importedRoutine.length > 0 ? [importedRoutine] : []);
    setHistoryIndex(importedRoutine.length > 0 ? 0 : -1);
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

      // iOS respects the hardware mute switch for Web Audio API but not for
      // <audio> element playback. Streaming a silent oscillator through a
      // MediaStream into an <audio> element (started on a user gesture here)
      // switches the AVAudioSession category to Playback for the whole page,
      // so subsequent Web Audio beeps on context.destination bypass mute too.
      try {
        const dest = audioContextRef.current.createMediaStreamDestination();
        const silentOsc = audioContextRef.current.createOscillator();
        const silentGain = audioContextRef.current.createGain();
        silentGain.gain.value = 0;
        silentOsc.connect(silentGain);
        silentGain.connect(dest);
        silentOsc.start();
        const el = new Audio();
        el.srcObject = dest.stream;
        audioOutputRef.current = el;
        void el.play();
      } catch {
        // MediaStream not supported; mute-bypass won't work but audio still plays
      }
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
      if (audioOutputRef.current?.paused) {
        void audioOutputRef.current.play();
      }
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
  const isWorkMode = session.mode === "sideA" || session.mode === "sideB";
  const canStart =
    isWorkMode ||
    (Boolean(activeExercise) &&
      session.mode !== "finished" &&
      !completedIds.has(activeExercise?.instanceId ?? ""));
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
        <div className="header-actions">
          <a
            className="github-link"
            href="https://github.com/duke8585/exercise-blocks"
            rel="noreferrer"
            target="_blank"
            aria-label="View source on GitHub"
          >
            <svg aria-hidden="true" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                fillRule="evenodd"
              />
            </svg>
          </a>
          <button className="secondary-button" type="button" onClick={resetSession}>
            Reset
          </button>
        </div>
      </header>

      <p className="workflow-hint">
        Pick your filters below, hit <strong>Generate routine</strong>, then drag{" "}
        <span aria-hidden="true">⠿</span> to reorder or swipe a card right to gray it
        out — then hit <strong>Start</strong>.
      </p>

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

        <div className="filter-section">
          <label className="starred-filter-toggle">
            <input
              type="checkbox"
              checked={starredOnly}
              onChange={() => setStarredOnly((v) => !v)}
            />
            <span>⭐ Starred only</span>
            {starredIds.size > 0 && (
              <span className="starred-count">{starredIds.size}</span>
            )}
          </label>
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

            {(() => {
              const userTags = allTags.filter((t) => !t.startsWith("inventory:"));
              const inventoryTags = allTags.filter((t) => t.startsWith("inventory:"));
              return (
                <>
                  {userTags.length > 0 && (
                    <div className="tag-grid" aria-label="Tags">
                      {userTags.map((tag) => (
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
                  )}
                  {inventoryTags.length > 0 && (
                    <details>
                      <summary className="inventory-tags-summary">
                        Inventory versions ({inventoryTags.length})
                      </summary>
                      <div className="tag-grid" aria-label="Inventory tags">
                        {inventoryTags.map((tag) => (
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
                    </details>
                  )}
                </>
              );
            })()}
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
        <div className="timer-actions">
          {isWorkMode && (
            <button className="stop-button" type="button" onClick={stopActiveExercise}>
              Stop
            </button>
          )}
          <button
            className="start-button"
            type="button"
            disabled={!canStart}
            onClick={isWorkMode ? togglePause : startActiveExercise}
          >
            {isWorkMode ? (session.paused ? "Resume" : "Pause") : "Start"}
          </button>
        </div>
      </section>

      <section className="routine-section" aria-labelledby="routine-heading">
        <div className="section-heading">
          <h2 id="routine-heading">Routine</h2>
          <div className="routine-heading-right">
            {routineHistory.length > 1 && (
              <div className="history-nav">
                <button
                  type="button"
                  disabled={historyIndex === 0}
                  onClick={() => goToHistoryIndex(historyIndex - 1)}
                  aria-label="Previous routine"
                >
                  ←
                </button>
                <span>{historyIndex + 1} / {routineHistory.length}</span>
                <button
                  type="button"
                  disabled={historyIndex === routineHistory.length - 1}
                  onClick={() => goToHistoryIndex(historyIndex + 1)}
                  aria-label="Next routine"
                >
                  →
                </button>
              </div>
            )}
            <span>{routine.length} exercises</span>
          </div>
        </div>

        {routine.length === 0 ? (
          <div className="empty-state">Generate a routine to begin.</div>
        ) : (
          <ol className="routine-list">
            {routine.map((exercise, index) => {
              const isActive = session.activeIndex === index;
              const isDone = completedIds.has(exercise.instanceId);
              const detail = exerciseDetailText(exercise);

              const isDragging = drag?.index === index;
              const dragDeltaX = isDragging ? drag.deltaX : 0;

              const isReordering = reorderDrag?.id === exercise.instanceId;
              const reorderOffsetY = isReordering ? reorderDrag.offsetY : 0;

              // While another card is being dragged, shift this one out of
              // the way to open a gap at the spot the dragged card would
              // land in - the "cards jump behind the one being dragged"
              // effect. positionAmongOthers is this card's index once the
              // dragged card is (conceptually) removed from the list.
              let shiftY = 0;
              if (reorderDrag && !isReordering && reorderOriginalIndex !== -1) {
                const positionAmongOthers = index < reorderOriginalIndex ? index : index - 1;
                const insertionIndex = reorderDrag.insertionIndex;
                if (
                  insertionIndex < reorderOriginalIndex &&
                  positionAmongOthers >= insertionIndex &&
                  positionAmongOthers < reorderOriginalIndex
                ) {
                  shiftY = reorderDraggedSpan;
                } else if (
                  insertionIndex > reorderOriginalIndex &&
                  positionAmongOthers >= reorderOriginalIndex &&
                  positionAmongOthers < insertionIndex
                ) {
                  shiftY = -reorderDraggedSpan;
                }
              }

              return (
                <li
                  className={`routine-item ${isActive ? "active" : ""} ${
                    isDone ? "done" : ""
                  } ${isReordering ? "reordering" : ""}`}
                  key={exercise.instanceId}
                  ref={(node) => {
                    routineItemRefs.current[index] = node;
                  }}
                >
                  <div
                    className="swipe-hint"
                    aria-hidden="true"
                    style={{ opacity: Math.min(Math.abs(dragDeltaX) / SWIPE_COMPLETE_THRESHOLD, 1) }}
                  >
                    Swipe to mark done
                  </div>
                  <div
                    className="routine-card"
                    style={{
                      transform: [
                        dragDeltaX ? `translateX(${dragDeltaX}px)` : "",
                        reorderOffsetY ? `translateY(${reorderOffsetY}px)` : "",
                        shiftY ? `translateY(${shiftY}px)` : ""
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined,
                      transition: isDragging || isReordering ? "none" : "transform 0.2s ease",
                      zIndex: isReordering ? 1 : undefined
                    }}
                    onPointerDown={(event) => handleCardPointerDown(event, index)}
                    onPointerMove={(event) => handleCardPointerMove(event, index)}
                    onPointerUp={() => handleCardPointerUp(index)}
                    onPointerCancel={() => setDrag(null)}
                  >
                    <div className="routine-card-top">
                      <button
                        className="reorder-handle"
                        type="button"
                        aria-label="Drag to reorder"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          handleReorderHandlePointerDown(event, exercise.instanceId);
                        }}
                        onPointerMove={(event) => {
                          event.stopPropagation();
                          handleReorderHandlePointerMove(event);
                        }}
                        onPointerUp={(event) => {
                          event.stopPropagation();
                          handleReorderHandlePointerUp();
                        }}
                        onPointerCancel={() => setReorderDrag(null)}
                        onClick={(event) => event.stopPropagation()}
                      >
                        ⠿
                      </button>
                      <button
                        className="routine-select"
                        type="button"
                        onClick={() => {
                          if (suppressNextClickRef.current) {
                            suppressNextClickRef.current = false;
                            return;
                          }
                          selectExercise(index);
                        }}
                      >
                        <span className="routine-index">{index + 1}</span>
                        <span>
                          <strong>{exercise.name}</strong>
                          <small>
                            {labelForGroup(exercise.groups[0])}
                            {exercise.sideMode === "leftRight" ? " · left/right" : ""}
                          </small>
                        </span>
                        <span className="state-pill">
                          {isDone ? "Done" : isActive ? "Active" : "Queued"}
                        </span>
                      </button>
                    </div>
                    <p className="exercise-description">{detail}</p>
                    <div className="exercise-card-footer">
                      <div className="exercise-links">
                        {(() => {
                          const video = exerciseVideoLink(exercise);
                          return (
                            <a
                              className="yt-shorts-link"
                              href={video.href}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {video.label}
                            </a>
                          );
                        })()}
                        {exercise.links?.map((link) => (
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
                      <button
                        className={`star-button ${starredIds.has(exercise.id) ? "starred" : ""}`}
                        type="button"
                        aria-label={starredIds.has(exercise.id) ? "Unstar exercise" : "Star exercise"}
                        onClick={() => toggleStar(exercise.id)}
                      >
                        {starredIds.has(exercise.id) ? "★" : "☆"}
                      </button>
                    </div>
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

function youtubeSearchUrl(exerciseName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} exercise #shorts`)}`;
}

// When an exercise carries an explicit demonstration video, link straight to it
// with a label that reflects whether it is a YouTube Short or a normal video.
// Otherwise fall back to the generic "#shorts" search.
function exerciseVideoLink(exercise: Exercise): { href: string; label: string } {
  if (exercise.videoUrl) {
    const isShort = exercise.videoUrl.includes("/shorts/");
    return { href: exercise.videoUrl, label: isShort ? "▶ #shorts" : "▶ video" };
  }
  return { href: youtubeSearchUrl(exercise.name), label: "▶ #shorts" };
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

  return `${labelForGroup(exercise.groups[0])} focus. ${sideHint}`;
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
