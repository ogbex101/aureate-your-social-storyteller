import { useId } from "react";

// Deterministic abstract editorial art — gradient mesh + grain + a line motif —
// standing in for real photography without any network/image assets.
const palettes: [string, string][] = [
  ["oklch(0.62 0.15 85)", "oklch(0.28 0.05 265)"],
  ["oklch(0.58 0.12 55)", "oklch(0.26 0.05 250)"],
  ["oklch(0.5 0.09 200)", "oklch(0.27 0.05 270)"],
  ["oklch(0.56 0.11 340)", "oklch(0.27 0.05 260)"],
  ["oklch(0.5 0.09 150)", "oklch(0.27 0.05 255)"],
  ["oklch(0.6 0.13 30)", "oklch(0.28 0.05 275)"],
];

function hash(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function PostArt({ seed, className = "" }: { seed: string; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = hash(seed);
  const [a, b] = palettes[h % palettes.length];
  const cx = 25 + (h % 50);
  const cy = 25 + ((h >> 4) % 50);
  const rings = 2 + (h % 3);
  const rotate = h % 360;
  const motif = h % 3;

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`pa-g-${uid}`} cx={`${cx}%`} cy={`${cy}%`} r="85%">
          <stop offset="0%" stopColor={a} stopOpacity="0.6" />
          <stop offset="55%" stopColor={b} stopOpacity="0.75" />
          <stop offset="100%" stopColor="oklch(0.15 0.03 265)" stopOpacity="0.95" />
        </radialGradient>
        <filter id={`pa-n-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.045 0" />
        </filter>
      </defs>
      <rect width="100" height="100" fill={`url(#pa-g-${uid})`} />
      <g stroke="oklch(0.86 0.13 85 / 0.35)" strokeWidth="0.4" fill="none" transform={`rotate(${rotate} ${cx} ${cy})`}>
        {motif === 0 &&
          Array.from({ length: rings }).map((_, i) => <circle key={i} cx={cx} cy={cy} r={14 + i * 12} />)}
        {motif === 1 &&
          Array.from({ length: rings + 2 }).map((_, i) => (
            <line key={i} x1={-20} y1={i * 16 - 10} x2={120} y2={i * 16 - 10} />
          ))}
        {motif === 2 &&
          Array.from({ length: rings }).map((_, i) => (
            <rect key={i} x={cx - 10 - i * 10} y={cy - 10 - i * 10} width={(10 + i * 10) * 2} height={(10 + i * 10) * 2} />
          ))}
      </g>
      <rect width="100" height="100" filter={`url(#pa-n-${uid})`} />
    </svg>
  );
}
