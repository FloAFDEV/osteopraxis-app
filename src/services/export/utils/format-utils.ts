import { PaymentStatus } from "@/types";

/**
 * Traduit les statuts de paiement en français
 */
export const translatePaymentStatus = (status: string): string => {
	const statusMap: Record<string, string> = {
		PENDING: "En attente",
		PAID: "Payée",
		CANCELED: "Annulée",
	};

	return statusMap[status] || status;
};
