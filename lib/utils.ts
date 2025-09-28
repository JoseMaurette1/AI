import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId(prefix: string = ""): string {
  return prefix + Math.random().toString(36).substring(2) + Date.now().toString(36)
}
