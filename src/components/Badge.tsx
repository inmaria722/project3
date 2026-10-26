import type { ReactNode } from "react";

export type Tone = "default" | "success" | "warning" | "danger" | "brand";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
}

export default function Badge({ children, tone = "default" }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
