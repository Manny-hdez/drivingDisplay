// A tiny prerecorded trajectory. Coordinates are meters; time is seconds.
export const trajectory = [
  { t: 0, x: -42, z: 2 },
  { t: 3, x: -18, z: 2 },
  { t: 5, x: -8, z: 2 },
  { t: 7, x: -8, z: 2 },
  { t: 9, x: 0, z: 2 },
  { t: 12, x: 24, z: 2 },
  { t: 14, x: 42, z: 2 },
];
export const duration = trajectory.at(-1).t;

// Locate the two recorded samples around a replay time, then blend between them.
// Rendering frame rate never enters this calculation.
export function sampleAt(time, samples = trajectory) {
  const t = Math.max(samples[0].t, Math.min(time, samples.at(-1).t));
  let index = samples.findIndex((point, i) => i > 0 && point.t >= t);
  if (index < 1) index = samples.length - 1;
  const a = samples[index - 1],
    b = samples[index];
  const blend = (t - a.t) / (b.t - a.t);
  return {
    x: a.x + (b.x - a.x) * blend,
    z: a.z + (b.z - a.z) * blend,
    speed: Math.hypot(b.x - a.x, b.z - a.z) / (b.t - a.t),
    start: a,
    end: b,
    blend,
  };
}
