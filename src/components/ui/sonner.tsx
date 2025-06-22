import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast: "group toast group-[.toaster]:bg-teal-50 group-[.toaster]:text-teal-900 group-[.toaster]:border-teal-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-teal-950 dark:group-[.toaster]:text-teal-100 dark:group-[.toaster]:border-teal-800",
					description:
						"group-[.toast]:text-teal-700 dark:group-[.toast]:text-teal-300",
					actionButton:
						"group-[.toast]:bg-emerald-600 group-[.toast]:text-white hover:group-[.toast]:bg-emerald-700 dark:group-[.toast]:bg-emerald-500 dark:hover:group-[.toast]:bg-emerald-600",
					cancelButton:
						"group-[.toast]:bg-teal-100 group-[.toast]:text-teal-500 hover:group-[.toast]:bg-teal-200 dark:group-[.toast]:bg-teal-800 dark:group-[.toast]:text-teal-100 dark:hover:group-[.toast]:bg-teal-700",
					closeButton:
						"group-[.toast]:bg-white group-[.toast]:text-teal-600 hover:group-[.toast]:bg-teal-100 dark:group-[.toast]:bg-teal-800 dark:group-[.toast]:text-teal-100 dark:hover:group-[.toast]:bg-teal-700 ",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
