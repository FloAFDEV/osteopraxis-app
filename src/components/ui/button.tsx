import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-800",
				primary:
					"bg-slate-600 text-white hover:bg-slate-500 active:bg-slate-700",
				destructive:
					"bg-red-600/80 text-white hover:bg-red-500/80 active:bg-red-700/80",
				outline:
					"border border-slate-300 dark:border-slate-600 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50",
				secondary:
					"bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
				ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
				link: "text-slate-500 dark:text-slate-400 underline-offset-4 hover:underline hover:text-slate-700 dark:hover:text-slate-200",
			},
			size: {
				default: "h-7 px-3 py-1.5",
				sm: "h-6 rounded-md px-2 text-sm",
				lg: "h-8 rounded-md px-4",
				icon: "h-7 w-7",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
