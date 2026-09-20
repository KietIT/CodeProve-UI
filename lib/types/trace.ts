/**
 * Execution-trace contract for the algorithm visualizer (practice mode).
 * The backend runs the student's code with a tracer (Python sys.settrace) and
 * returns one frame per executed step. See
 * docs/superpowers/plans/CodeProve-Algorithm-Visualizer-Design.md.
 */

export type VizValue =
  | { kind: "scalar"; value: string }
  /** A 1D array/list. `ptrs` maps a variable name (i, j, left…) to an index. */
  | { kind: "array"; items: string[]; ptrs?: Record<string, number> }
  /** dict/hash-map. Received by the contract; rendered as text in the MVP. */
  | { kind: "map"; entries: [string, string][] };

export type TraceFrame = {
  /** 1-based line currently executing. */
  line: number;
  event: "line" | "call" | "return";
  /** Variables in the current scope. */
  locals: Record<string, VizValue>;
};

export type TraceResponse = {
  frames: TraceFrame[];
  stdout: string;
  /** Present when the run raised or was cut off (timeout / frame cap). */
  error?: string;
};
