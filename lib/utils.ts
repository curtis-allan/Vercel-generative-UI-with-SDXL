import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDimensions(size: string) {
  switch (true) {
    case size === "square_hd":
      return [1024, 1024, 1 / 1];
    case size === "square":
      return [512, 512, 1 / 1];
    case size === "portrait_4_3":
      return [768, 1024, 3 / 4];
    case size === "portrait_16_9":
      return [576, 1024, 9 / 16];
    case size === "landscape_4_3":
      return [1024, 720, 4 / 3];
    case size === "landscape_16_9":
      return [1024, 576, 16 / 9];
  }
}
