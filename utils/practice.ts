import { type MockWord } from "@/types/mock";

export function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase();
}

export function buildChoices(words: MockWord[], currentWord?: MockWord) {
  if (!currentWord) {
    return [];
  }

  const wrongChoices = words
    .filter((word) => word.id !== currentWord.id)
    .map((word) => word.translation)
    .slice(0, 3);

  const fallbackChoices = [
    "scheduled meeting",
    "small first course",
    "make a place clean",
  ].filter(
    (choice) =>
      normalizeAnswer(choice) !== normalizeAnswer(currentWord.translation),
  );

  return sortChoices([
    currentWord.translation,
    ...wrongChoices,
    ...fallbackChoices,
  ].slice(0, 4));
}

function sortChoices(choices: string[]) {
  return [...choices].sort((a, b) => a.localeCompare(b));
}
