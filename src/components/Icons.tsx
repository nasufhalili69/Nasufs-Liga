import type { ReactNode } from "react";

/* Schlichte Linien-Icons für Buttons und Navigation. */

const PATHS = {
  chart: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M9 15v-3M12 15V9M15 15v-5" />
    </>
  ),
  list: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="3" />
      <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  plus: <path d="M12 6v12M6 12h12" />,
  left: <path d="M14 6l-6 6 6 6" />,
  right: <path d="M10 6l6 6-6 6" />,
  close: <path d="M7 7l10 10M17 7L7 17" />,
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
