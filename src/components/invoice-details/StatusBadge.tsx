import clsx from "clsx";

export const StatusBadge = ({ status }: { status: string }) => {
	const getStatusColor = (status: string) => {
		switch (status.toUpperCase()) {
			case "PAID":
				return "bg-green-200/60 text-green-900 dark:bg-green-900/80 dark:text-green-200 border-green-300 dark:border-green-700";
			case "PENDING":
				return "bg-yellow-100/80 text-yellow-900 dark:bg-yellow-900/70 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
			case "CANCELLED":
			case "CANCELED":
				return "bg-red-100/90 text-red-900 dark:bg-red-900/70 dark:text-red-300 border-red-200 dark:border-red-800";
			default:
				return "bg-gray-100/80 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300 border-gray-200 dark:border-gray-700";
		}
	};

	const getStatusText = (status: string) => {
		switch (status.toUpperCase()) {
			case "PAID":
				return "Payée";
			case "PENDING":
				return "En attente";
			case "CANCELLED":
			case "CANCELED":
				return "Annulée";
			default:
				return "Statut inconnu";
		}
	};

	return (
		<div
			className={clsx(
				"mt-2 inline-block px-2.5 py-1 text-sm font-semibold rounded-full border",
				getStatusColor(status),
			)}
		>
			{getStatusText(status)}
		</div>
	);
};
