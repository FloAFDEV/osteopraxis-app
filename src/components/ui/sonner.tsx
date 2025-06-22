
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-green-900/20 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-800",
          description: "group-[.toast]:text-green-700 dark:group-[.toast]:text-green-300",
          actionButton:
            "group-[.toast]:bg-green-600 group-[.toast]:text-white hover:group-[.toast]:bg-green-700",
          cancelButton:
            "group-[.toast]:bg-green-100 group-[.toast]:text-green-800 hover:group-[.toast]:bg-green-200 dark:group-[.toast]:bg-green-800 dark:group-[.toast]:text-green-100 dark:hover:group-[.toast]:bg-green-700",
          closeButton:
            "group-[.toast]:bg-green-200 group-[.toast]:text-green-800 hover:group-[.toast]:bg-green-300 dark:group-[.toast]:bg-green-800 dark:group-[.toast]:text-green-200 dark:hover:group-[.toast]:bg-green-700 group-[.toast]:border-green-300 dark:group-[.toast]:border-green-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
