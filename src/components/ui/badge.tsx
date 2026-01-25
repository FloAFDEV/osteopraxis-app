
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-600 text-white",
        secondary:
          "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        destructive:
          "border-transparent bg-red-600/80 text-white",
        warning:
          "border-transparent bg-amber-500/80 text-white",
        success:
          "border-transparent bg-emerald-600/80 text-white",
        outline:
          "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-transparent",
        gender:
          "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        minor:
          "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        status:
          "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
