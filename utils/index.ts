import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { buildChoices, normalizeAnswer } from "./practice";
export { getErrorMessage } from "./errors";
export { getAverage, getMistakeRate, getPercentage } from "./progress";
