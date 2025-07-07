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
  return;
};