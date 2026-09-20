import type { TraceResponse } from "@/lib/types/trace";

/**
 * Sample trace for a hash-map Two Sum on nums=[2,7,11,15], target=9.
 * Doubles as the executable spec the backend trace endpoint should reproduce
 * (POST /api/practice/trace) and as fixture data for unit tests.
 *
 *   1  def two_sum(nums, target):
 *   2      seen = {}
 *   3      for i in range(len(nums)):
 *   4          complement = target - nums[i]
 *   5          if complement in seen:
 *   6              return [seen[complement], i]
 *   7          seen[nums[i]] = i
 */
const NUMS = ["2", "7", "11", "15"];
const arr = (i: number) => ({ kind: "array" as const, items: NUMS, ptrs: { i } });
const scalar = (value: string) => ({ kind: "scalar" as const, value });
const map = (entries: [string, string][]) => ({ kind: "map" as const, entries });

export const twoSumTrace: TraceResponse = {
  stdout: "",
  frames: [
    { line: 2, event: "line", locals: { nums: arr(0), target: scalar("9") } },
    { line: 3, event: "line", locals: { nums: arr(0), target: scalar("9"), seen: map([]) } },
    { line: 4, event: "line", locals: { nums: arr(0), target: scalar("9"), seen: map([]), i: scalar("0") } },
    { line: 5, event: "line", locals: { nums: arr(0), target: scalar("9"), seen: map([]), i: scalar("0"), complement: scalar("7") } },
    { line: 7, event: "line", locals: { nums: arr(0), target: scalar("9"), seen: map([]), i: scalar("0"), complement: scalar("7") } },
    { line: 3, event: "line", locals: { nums: arr(1), target: scalar("9"), seen: map([["2", "0"]]), i: scalar("0"), complement: scalar("7") } },
    { line: 4, event: "line", locals: { nums: arr(1), target: scalar("9"), seen: map([["2", "0"]]), i: scalar("1"), complement: scalar("7") } },
    { line: 5, event: "line", locals: { nums: arr(1), target: scalar("9"), seen: map([["2", "0"]]), i: scalar("1"), complement: scalar("2") } },
    { line: 6, event: "line", locals: { nums: arr(1), target: scalar("9"), seen: map([["2", "0"]]), i: scalar("1"), complement: scalar("2") } },
    { line: 6, event: "return", locals: { nums: arr(1), target: scalar("9"), seen: map([["2", "0"]]), i: scalar("1"), complement: scalar("2") } },
  ],
};
