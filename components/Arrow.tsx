/** A small drawn arrow for page furniture. It takes the text colour. */
const PATHS = {
  left: "M13 5H1.5M5.5 1L1.5 5L5.5 9",
  right: "M1 5H12.5M8.5 1L12.5 5L8.5 9",
  down: "M7 0.5V9M3.5 5.5L7 9L10.5 5.5",
};

export function Arrow({ dir }: { dir: keyof typeof PATHS }) {
  return (
    <svg className={`arrow arrow--${dir}`} viewBox="0 0 14 10" width={14} height={10} aria-hidden focusable="false">
      <path d={PATHS[dir]} />
    </svg>
  );
}
