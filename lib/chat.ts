/** True when a chat reply contains a fenced code block (```...```). */
export const hasCodeBlock = (text: string): boolean => /```[\s\S]*?```/.test(text);
