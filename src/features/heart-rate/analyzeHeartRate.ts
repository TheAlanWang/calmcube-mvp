export type RelaxationMode = "breathing" | "music" | "chat";

export const HR_MIN = 40;
export const HR_MAX = 180;

export function analyzeHeartRate(value: number): RelaxationMode {
  if (Number.isNaN(value)) {
    throw new Error("Heart rate must be a valid number");
  }

  if (value <= 0) {
    throw new Error("Heart rate must be positive");
  }

  if (value > 100) {
    return "breathing";
  }

  if (value >= 80) {
    return "music";
  }

  return "chat";
}

export function clampHeartRate(value: number): number {
  if (value < HR_MIN) {
    return HR_MIN;
  }

  if (value > HR_MAX) {
    return HR_MAX;
  }

  return value;
}
