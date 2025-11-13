import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * shadcn/ui에서 사용하는 공용 클래스 병합 유틸
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
