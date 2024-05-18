import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDimensions(size: string) {
  switch (true) {
    case size === "square_hd":
      return [1024, 1024];
    case size === "square":
      return [512, 512];
    case size === "portrait_4_3":
      return [768, 1024];
    case size === "portrait_16_9":
      return [576, 1024];
    case size === "landscape_4_3":
      return [1024, 720];
    case size === "landscape_16_9":
      return [1024, 576];
  }
}
