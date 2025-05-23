
import React from "react";
import { Line } from "recharts";
import { LINE_COLORS, LINE_WIDTH } from "./line-colors";

interface LineConfigProps {
  dataKey: "total" | "hommes" | "femmes" | "enfants";
  delay?: number;
}

/**
 * Composant de configuration pour chaque ligne du graphique
 */
export const LineConfig: React.FC<LineConfigProps> = ({ dataKey, delay = 0 }) => {
  const strokeWidth = dataKey === "total" ? LINE_WIDTH.total : LINE_WIDTH.default;
  const color = LINE_COLORS[dataKey];
  const animationDuration = 1200 + delay;
  
  return (
    <Line
      type="monotone"
      dataKey={dataKey}
      stroke={color}
      strokeWidth={strokeWidth}
      dot={{ stroke: color, strokeWidth: 2, r: dataKey === "total" ? 4 : 3 }}
      activeDot={{ r: dataKey === "total" ? 6 : 5 }}
      name={dataKey}
      isAnimationActive={true}
      animationDuration={animationDuration}
      connectNulls={true}
    />
  );
};
