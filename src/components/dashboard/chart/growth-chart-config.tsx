
import { Line } from "recharts";

export const GROWTH_CHART_COLORS = {
  total: "#9b87f5",
  hommes: "#60a5fa",
  femmes: "#b93dcc",
  enfants: "#34d399",
} as const;

export const NAME_MAP = {
  total: "Total général",
  hommes: "Hommes",
  femmes: "Femmes",
  enfants: "Enfants",
} as const;

export const TOOLTIP_NAME_MAP = {
  total: "Total",
  hommes: "Hommes",
  femmes: "Femmes",
  enfants: "Enfants",
} as const;

interface LineConfig {
  dataKey: keyof typeof GROWTH_CHART_COLORS;
  strokeWidth: number;
  dotRadius: number;
  activeDotRadius: number;
  animationDuration: number;
}

const LINE_CONFIGS: LineConfig[] = [
  {
    dataKey: "total",
    strokeWidth: 3,
    dotRadius: 4,
    activeDotRadius: 6,
    animationDuration: 1200,
  },
  {
    dataKey: "hommes",
    strokeWidth: 2,
    dotRadius: 3,
    activeDotRadius: 5,
    animationDuration: 1500,
  },
  {
    dataKey: "femmes",
    strokeWidth: 2,
    dotRadius: 3,
    activeDotRadius: 5,
    animationDuration: 1800,
  },
  {
    dataKey: "enfants",
    strokeWidth: 2,
    dotRadius: 3,
    activeDotRadius: 5,
    animationDuration: 2100,
  },
];

export function renderGrowthLines() {
  return LINE_CONFIGS.map((config) => (
    <Line
      key={config.dataKey}
      type="monotone"
      dataKey={config.dataKey}
      stroke={GROWTH_CHART_COLORS[config.dataKey]}
      strokeWidth={config.strokeWidth}
      dot={{
        stroke: GROWTH_CHART_COLORS[config.dataKey],
        strokeWidth: 2,
        r: config.dotRadius,
      }}
      activeDot={{ r: config.activeDotRadius }}
      name={config.dataKey}
      isAnimationActive={true}
      animationDuration={config.animationDuration}
      connectNulls={true}
    />
  ));
}
