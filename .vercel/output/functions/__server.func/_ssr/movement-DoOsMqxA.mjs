const MOVEMENT_TYPES = [
  { value: "gait_walk", label: "Gait / Walk" },
  { value: "ground_flow", label: "Ground Flow" },
  { value: "hip_hinge", label: "Hip Hinge" },
  { value: "squat", label: "Squat" },
  { value: "overhead", label: "Overhead" },
  { value: "spinal_articulation", label: "Spinal Articulation" },
  { value: "custom", label: "Custom" }
];
function movementLabel(t) {
  return MOVEMENT_TYPES.find((m) => m.value === t)?.label ?? t;
}
function warmGreeting(name) {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const greet = hour < 5 ? "Still awake" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good evening";
  return name ? `${greet}, ${name}` : greet;
}
export {
  MOVEMENT_TYPES as M,
  movementLabel as m,
  warmGreeting as w
};
