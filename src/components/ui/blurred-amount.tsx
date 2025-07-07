import { usePrivacy } from "@/contexts/PrivacyContext";
import { cn } from "@/lib/utils";
import React from "react";

interface BlurredAmountProps {
	amount: number | string;
	className?: string;
	currency?: string;
	children?: React.ReactNode;
}

export const BlurredAmount: React.FC<BlurredAmountProps> = ({
	amount,
	className,
	currency = "€",
	children,
}) => {
	const { isNumbersBlurred } = usePrivacy();

	const formatAmount = (value: number | string) => {
		const numValue = typeof value === "string" ? parseFloat(value) : value;
		if (isNaN(numValue)) return value;

		return new Intl.NumberFormat("fr-FR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(numValue);
	};

	const content = children || `${formatAmount(amount)} ${currency}`;

	return (
		<span
			className={cn(
				"transition-all duration-200",
				isNumbersBlurred && "blur-md select-none",
				className
			)}
			title={
				isNumbersBlurred
					? "Montant masqué pour la confidentialité"
					: undefined
			}
		>
			{content}
		</span>
	);
};

interface BlurredNumberProps {
	number: number | string;
	className?: string;
	suffix?: string;
	prefix?: string;
}

export const BlurredNumber: React.FC<BlurredNumberProps> = ({
	number,
	className,
	suffix = "",
	prefix = "",
}) => {
	const { isNumbersBlurred } = usePrivacy();

	return (
		<span
			className={cn(
				"transition-all duration-200",
				isNumbersBlurred && "blur-md select-none",
				className
			)}
			title={
				isNumbersBlurred
					? "Nombre masqué pour la confidentialité"
					: undefined
			}
		>
			{prefix}
			{number}
			{suffix}
		</span>
	);
};
