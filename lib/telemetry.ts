import { sendEvents } from "@/lib/api";

type Ev = {
  type: string;
  ts: number;
  payload?: Record<string, unknown>;
  integrity_flags?: string[];
};

/**
 * Creates a telemetry client for a single attempt session.
 * Events are buffered in memory and flushed to the backend every ~2 seconds,
 * and on an explicit `stop()` call (e.g. on component unmount).
 */
export function createTelemetry(attemptId: number) {
  let queue: Ev[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;

  async function flush() {
    if (queue.length === 0) return;
    const batch = queue;
    queue = [];
    try {
      await sendEvents(attemptId, batch);
    } catch {
      // Re-queue failed events so they are retried next flush cycle.
      queue = [...batch, ...queue];
    }
  }

  function log(
    type: string,
    payload: Record<string, unknown> = {},
    flags: string[] = [],
  ) {
    queue.push({ type, ts: Date.now(), payload, integrity_flags: flags });
  }

  timer = setInterval(flush, 2000);

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    return flush();
  }

  return { log, flush, stop };
}
