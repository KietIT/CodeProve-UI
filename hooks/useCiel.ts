"use client";

import { useMutation } from "@tanstack/react-query";
import { sendMentor } from "@/lib/api";
import type { MentorReply } from "@/lib/types/ciel";
import { prepareMentorRequest, type AskCielInput } from "./cielGuard";

export { CielGuardError, prepareMentorRequest } from "./cielGuard";
export type { AskCielInput, CielGuardReason } from "./cielGuard";

/**
 * Wraps the Ciel mentor service in a TanStack Query mutation. Components ask
 * Ciel through this hook rather than calling the service layer directly.
 * The API request/response shape is unchanged from the pre-refactor baseline.
 */
export function useCiel(attemptId: number | null) {
  return useMutation<MentorReply, Error, AskCielInput>({
    mutationFn: async (input) => {
      const { id, message, code } = prepareMentorRequest(attemptId, input);
      return sendMentor(id, message, code);
    },
  });
}
