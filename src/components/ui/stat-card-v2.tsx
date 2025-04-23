
import { cn } from "@/lib/utils";

interface StatCardV2Props {
  label: string;
  value: string | number;
  color?: "blue" | "purple" | "green" | "red" | "amber";
}

export function StatCardV2({ label, value, color = "blue" }: StatCardV2Props) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className={cn("p-4 rounded-lg flex flex-col items-center", colorClasses[color])}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}
