
import { LegendProps } from "recharts";

interface CustomLegendProps extends LegendProps {
  nameMap: Record<string, string>;
}

export function CustomLegend({ payload, nameMap }: CustomLegendProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        marginTop: "8px",
        flexWrap: "wrap",
      }}
    >
      {payload?.map((entry, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: entry.color,
            }}
          />
          <span className="text-gray-700 dark:text-white text-sm">
            {nameMap[entry.value as string] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
