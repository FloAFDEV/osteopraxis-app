import { Zap, Shield, Sparkles, Clock } from "lucide-react";

type BadgeType = "simple" | "rapide" | "securise" | "intuitif";

interface FeatureBadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeConfig: Record<BadgeType, { label: string; icon: typeof Zap; colors: string }> = {
  simple: {
    label: "Simple",
    icon: Sparkles,
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  rapide: {
    label: "Rapide",
    icon: Zap,
    colors: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  securise: {
    label: "Sécurisé",
    icon: Shield,
    colors: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  intuitif: {
    label: "Intuitif",
    icon: Clock,
    colors: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

/**
 * Badge visuel pour mettre en avant les points forts d'une fonctionnalité
 */
export function FeatureBadge({ type, className = "" }: FeatureBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${config.colors}
        ${className}
      `}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
