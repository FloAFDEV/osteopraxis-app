import React from "react";
import { TooltipProps } from "recharts";

/**
 * Composant personnalisé pour l'affichage des tooltips du graphique
 */
export const CustomTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<number, string>) => {
	if (!active || !payload || !payload.length) {
		return null;
	}

	// Styles pour le container du tooltip
	const tooltipStyle = {
		backgroundColor: "#0891b2",
		border: "none",
		borderRadius: "8px",
		padding: "6px 10px",
		boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
		color: "#ffffff",
	};

	return (
		<div style={tooltipStyle}>
			<p className="text-white font-bold text-sm mb-1">{label}</p>
			{payload.map((entry, index) => (
				<div
					key={`tooltip-item-${index}`}
					className="flex justify-between items-center py-1"
				>
					<span className="text-white text-sm mr-4">
						{entry.name}:
					</span>
					<span className="text-white font-medium text-sm">
						{entry.value} patients
					</span>
				</div>
			))}
		</div>
	);
};
