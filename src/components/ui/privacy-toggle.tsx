import { Button } from "@/components/ui/button";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
interface PrivacyToggleProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}
export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  className,
  variant = "ghost",
  size = "sm"
}) => {
  const {
    isNumbersBlurred,
    toggleNumbersBlur
  } = usePrivacy();
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleNumbersBlur}
      className={cn(
        "flex items-center gap-2",
        className
      )}
      title={isNumbersBlurred ? "Afficher les montants" : "Masquer les montants"}
    >
      {isNumbersBlurred ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
      {isNumbersBlurred ? "Afficher" : "Masquer"}
    </Button>
  );
};