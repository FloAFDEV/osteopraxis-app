
import { Cabinet, Quote, Osteopath, Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface QuotePrintViewProps {
	quote: Quote;
	patient?: Patient;
	osteopath?: Osteopath;
	cabinet?: Cabinet;
}

export const QuotePrintView = ({
	quote,
	patient,
	osteopath,
	cabinet,
}: QuotePrintViewProps) => {
	const formatAmount = (amount: number) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
		}).format(amount);
	};

	const formattedDate = format(new Date(quote.createdAt), "dd MMMM yyyy", {
		locale: fr,
	});

	const formattedValidUntil = format(new Date(quote.validUntil), "dd MMMM yyyy", {
		locale: fr,
	});

	const getPatientName = () => {
		if (patient) {
			return `${patient.firstName} ${patient.lastName}`;
		}
		return `Patient #${quote.patientId}`;
	};

	const getStatusLabel = (status: Quote["status"]) => {
		switch (status) {
			case "DRAFT":
				return { label: "BROUILLON", color: "text-gray-600" };
			case "SENT":
				return { label: "ENVOYÉ", color: "text-blue-600" };
			case "ACCEPTED":
				return { label: "ACCEPTÉ", color: "text-green-600" };
			case "REJECTED":
				return { label: "REFUSÉ", color: "text-red-600" };
			case "EXPIRED":
				return { label: "EXPIRÉ", color: "text-orange-600" };
			default:
				return { label: "INCONNU", color: "text-gray-500" };
		}
	};

	return (
		<div className="bg-white p-4 max-w-3xl mx-auto flex flex-col min-h-screen justify-between print:min-h-screen print:p-2">
			{/* Partie haute */}
			<div className="flex-1">
				{/* En-tête */}
				<div className="flex justify-between items-start mb-16">
					{/* Colonne gauche : titre + logo + infos */}
					<div>
						{/* Ligne titre + logo */}
						<div className="flex items-center gap-4 mb-2 mt-6">
							<h1 className="text-2xl font-extrabold text-amber-700">
								{cabinet?.name || "PatientHub"}
							</h1>
							{cabinet?.logoUrl && (
								<img
									src={cabinet.logoUrl}
									alt={`Logo ${cabinet.name}`}
									className="h-10 object-contain"
									style={{ maxWidth: "150px" }}
								/>
							)}
						</div>

						{/* Infos pro */}
						<p className="text-gray-700 font-medium">
							{osteopath?.professional_title || "Ostéopathe D.O."}
						</p>
						<p className="text-gray-600 mt-1">
							{cabinet ? (
								<>
									{cabinet.address}
									<br />
									{cabinet.phone && (
										<>
											{cabinet.phone}
											<br />
										</>
									)}
									{cabinet.email && (
										<>
											{cabinet.email}
											<br />
										</>
									)}
								</>
							) : (
								<>
									123 Rue de la Santé
									<br />
									75001 Paris, France
									<br />
									Tél: 01 23 45 67 89
								</>
							)}
						</p>

						{/* Infos administratives */}
						<div className="text-gray-600 mt-2 text-sm space-y-1">
							{osteopath?.siret && (
								<p className="font-medium">
									SIRET: {osteopath.siret}
								</p>
							)}
							{osteopath?.rpps_number && (
								<p className="font-medium">
									RPPS: {osteopath.rpps_number}
								</p>
							)}
							{osteopath?.ape_code && (
								<p className="font-medium">
									Code APE: {osteopath.ape_code}
								</p>
							)}
						</div>
					</div>

					{/* Colonne droite : info devis */}
					<div className="text-right mt-6">
						<h2 className="text-lg font-medium text-amber-700 mb-1">
							DEVIS
						</h2>
						<p className="font-medium text-amber-600">
							n° #{quote.id.toString().padStart(4, "0")}
						</p>
						<p className="mt-4 text-gray-600 whitespace-nowrap">
							Date d'émission: {formattedDate}
						</p>
						<p className="text-gray-600 whitespace-nowrap">
							Valide jusqu'au: {formattedValidUntil}
						</p>
						<p className={`font-bold text-lg mt-2 ${getStatusLabel(quote.status).color}`}>
							{getStatusLabel(quote.status).label}
						</p>
					</div>
				</div>

				{/* Infos patient */}
				<div className="grid grid-cols-2 gap-8 mb-6">
					<div>
						<h3 className="font-medium text-amber-700 mb-3">
							Établi pour:
						</h3>
						<div className="border-l-4 border-amber-200 pl-4 break-words">
							<p className="font-medium text-gray-800 text-lg mb-2">
								{getPatientName()}
							</p>
							{patient?.birthDate && (
								<p className="text-gray-600 text-sm mb-2">
									Né(e) le{" "}
									{format(
										new Date(patient.birthDate),
										"dd/MM/yyyy"
									)}
								</p>
							)}
							{patient?.email && (
								<p className="text-gray-600">{patient.email}</p>
							)}
							{patient?.phone && (
								<p className="text-gray-600">{patient.phone}</p>
							)}
							{patient?.address && (
								<p className="text-gray-600">
									{patient.address}
								</p>
							)}
						</div>
					</div>
					<div className="text-right">
						<h3 className="font-medium text-amber-700 mb-3">
							Objet:
						</h3>
						<p className="font-medium text-gray-800">
							{quote.title}
						</p>
						{quote.description && (
							<p className="text-gray-600 mt-2 text-sm">
								{quote.description}
							</p>
						)}
					</div>
				</div>

				{/* Tableau prestations */}
				<div className="rounded-lg border border-amber-200 overflow-hidden mb-6">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-100">
								<th className="py-3 px-4 text-left text-amber-700 font-semibold">
									Désignation
								</th>
								<th className="py-3 px-4 text-center text-amber-700 font-semibold">
									Quantité
								</th>
								<th className="py-3 px-4 text-right text-amber-700 font-semibold">
									Prix unitaire
								</th>
								<th className="py-3 px-4 text-right text-amber-700 font-semibold">
									Total
								</th>
							</tr>
						</thead>
						<tbody>
							{quote.items.map((item, index) => (
								<tr key={index} className="border-t border-amber-200">
									<td className="py-4 px-4 text-gray-700">
										{item.description}
									</td>
									<td className="py-4 px-4 text-center text-gray-700">
										{item.quantity}
									</td>
									<td className="py-4 px-4 text-right text-gray-700">
										{formatAmount(item.unitPrice)}
									</td>
									<td className="py-4 px-4 text-right text-amber-700 font-medium">
										{formatAmount(item.total)}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr className="border-t border-amber-200 bg-amber-50/50">
								<td colSpan={3} className="py-3 px-4 text-right text-amber-700 font-medium">
									Total TTC
								</td>
								<td className="py-3 px-4 text-right text-amber-700 font-bold text-lg">
									{formatAmount(quote.amount)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>

				{/* Notes */}
				{quote.notes && (
					<div className="mb-6">
						<h3 className="font-medium text-amber-700 mb-2">
							Notes:
						</h3>
						<p className="text-gray-600 text-sm">
							{quote.notes}
						</p>
					</div>
				)}
			</div>

			{/* Signature/tampon de l'ostéopathe */}
			{osteopath?.stampUrl && (
				<div className="flex-1 flex justify-end">
					<div className="text-center">
						<p className="text-sm text-gray-600 mb-2">
							{osteopath.professional_title || "Ostéopathe D.O."}
						</p>
						<div className="max-h-[100px] max-w-[200px] mx-auto">
							<img
								src={osteopath.stampUrl}
								alt="Signature/Tampon professionnel"
								className="max-h-[100px] w-auto object-contain"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
								}}
							/>
						</div>
						<p className="text-sm text-gray-600 mt-2 font-medium">
							{osteopath.name}
						</p>
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="pt-6 mt-auto border-t border-gray-200">
				<h3 className="font-medium text-amber-700 mb-2">
					Conditions:
				</h3>
				<p className="text-gray-600 text-sm mb-2">
					Ce devis est valable jusqu'au {formattedValidUntil}.
				</p>
				<p className="text-gray-600 text-sm mb-4">
					Les tarifs sont exprimés en euros toutes taxes comprises.
				</p>
				<p className="text-gray-600 text-sm">
					Merci de votre confiance.
				</p>
			</footer>
		</div>
	);
};
