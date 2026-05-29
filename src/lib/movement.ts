export const MOVEMENT_TYPES = [
  { value: "gait_walk", label: "Gait / Walk" },
  { value: "ground_flow", label: "Ground Flow" },
  { value: "hip_hinge", label: "Hip Hinge" },
  { value: "squat", label: "Squat" },
  { value: "overhead", label: "Overhead" },
  { value: "spinal_articulation", label: "Spinal Articulation" },
  { value: "custom", label: "Custom" },
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number]["value"];

export function movementLabel(t: string): string {
  return MOVEMENT_TYPES.find((m) => m.value === t)?.label ?? t;
}

export function warmGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const greet =
    hour < 5 ? "Still awake" :
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    hour < 21 ? "Good evening" : "Good evening";
  return name ? `${greet}, ${name}` : greet;
}
