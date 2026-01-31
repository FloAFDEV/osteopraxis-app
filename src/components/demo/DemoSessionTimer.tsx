import { Clock, AlertTriangle } from "lucide-react";
import { useDemoSession } from "@/hooks/useDemoSession";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { useEffect, useState } from "react";

export const DemoSessionTimer = () => {
	const { isDemoActive, remainingMs, remainingFormatted, attemptsInfo } =
		useDemoSession();
	const [showPaywall, setShowPaywall] = useState(false);

	if (!isDemoActive) {
		return null;
	}

	const isLowTime = remainingMs < 5 * 60 * 1000; // Moins de 5 minutes

	return (
		<>
			<div
				className={`
        fixed bottom-4 left-4 p-3 rounded-lg shadow-lg border z-50 max-w-[260px]
        ${isLowTime ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}
      `}
			>
				<div className="flex items-start gap-3">
					<div className="flex-shrink-0 mt-0.5">
						{isLowTime ? (
							<AlertTriangle className="h-5 w-5 text-orange-500" />
						) : (
							<Clock className="h-5 w-5 text-gray-500" />
						)}
					</div>

					<div className="flex-1 space-y-2">
						<div className="font-medium text-gray-900">
							Session démo
						</div>

						<div className="text-sm text-gray-600">
							Temps restant:{" "}
							<span
								className={`font-mono font-medium ${isLowTime ? "text-orange-600" : "text-gray-900"}`}
							>
								{remainingFormatted}
							</span>
						</div>

						{isLowTime && (
							<div className="text-sm text-orange-600 flex items-center gap-1">
								<AlertTriangle className="h-3 w-3" /> Session bientôt expirée
							</div>
						)}

						{attemptsInfo && attemptsInfo.max !== 999 && (
							<div className="text-sm text-gray-500">
								Essais: {attemptsInfo.used}/{attemptsInfo.max}{" "}
								(reset: {attemptsInfo.resetPeriod})
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Paywall si temps écoulé (géré par le hook) */}
		</>
	);
};
