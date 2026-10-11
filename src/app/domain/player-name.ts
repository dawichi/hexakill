export const NAME_MIN = 3;
export const NAME_MAX = 14;

export function validatePlayerName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) return `Use at least ${NAME_MIN} characters.`;
  if (trimmed.length > NAME_MAX) return `Use at most ${NAME_MAX} characters.`;
  return null;
}
