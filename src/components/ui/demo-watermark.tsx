/**
 * 🎨 Watermark pour les données démo
 * Affiche un badge "DÉMO" sur les données fictives pour éviter toute confusion
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoWatermarkProps {
  /**
   * Position du watermark
   * @default "top-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

  /**
   * Taille du badge
   * @default "default"
   */
  size?: "sm" | "default" | "lg";

  /**
   * Classes CSS additionnelles
   */
  className?: string;

  /**
   * Variante du badge
   * @default "destructive"
   */
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function DemoWatermark({
  position = "top-right",
  size = "default",
  className,
  variant = "destructive"
}: DemoWatermarkProps) {
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    default: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5"
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "absolute z-10 font-bold tracking-wider select-none pointer-events-none",
        positionClasses[position],
        sizeClasses[size],
        className
      )}
    >
      DÉMO
    </Badge>
  );
}

/**
 * Wrapper pour ajouter automatiquement un watermark sur un conteneur
 */
interface DemoWatermarkWrapperProps {
  children: React.ReactNode;
  position?: DemoWatermarkProps["position"];
  size?: DemoWatermarkProps["size"];
  variant?: DemoWatermarkProps["variant"];
  className?: string;
}

export function DemoWatermarkWrapper({
  children,
  position = "top-right",
  size = "default",
  variant = "destructive",
  className
}: DemoWatermarkWrapperProps) {
  return (
    <div className={cn("relative", className)}>
      <DemoWatermark position={position} size={size} variant={variant} />
      {children}
    </div>
  );
}
