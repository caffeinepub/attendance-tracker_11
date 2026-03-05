import type { SkillLevel } from "../context/AppContext";

interface SkillBadgeProps {
  level: SkillLevel;
  className?: string;
}

export default function SkillBadge({ level, className = "" }: SkillBadgeProps) {
  const cls =
    level === "Beginner"
      ? "badge-beginner"
      : level === "Intermediate"
        ? "badge-intermediate"
        : "badge-advanced";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls} ${className}`}
    >
      {level}
    </span>
  );
}
