import { Cabinet, Invoice, Osteopath, Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InvoicePrintViewProps {
	invoice: Invoice;
	patient?: Patient;
	osteopath?: Osteopath;
	cabinet?: Cabinet;
}

export const InvoicePrintView = ({
	invoice,
	patient,
	osteopath,
	cabinet,
}: InvoicePrintViewProps) => {
	const formatAmount = (amount: number) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
		}).format(amount);
	};

	const formattedDate = format(new Date(invoice.date), "dd MMMM yyyy", {
		locale: fr,
	});

	const getPaymentMethod = (method?: string) => {
		if (!method) return "Non spécifié";
		switch (method) {
			case "CB":
				return "Carte Bancaire";
			case "ESPECES":
				return "Espèces";
			case "CHEQUE":
				return "Chèque";
			case "VIREMENT":
				return "Virement bancaire";
			default:
				return method;
		}
	};

	const getPatientName = () => {
		if (patient) {
			return `${patient.firstName} ${patient.lastName}`;
		}
		if (invoice.Patient) {
			return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
		}
		return `Patient #${invoice.patientId}`;
	};

	const getPaymentStatusLabel = (status?: string) => {
		switch (status) {
			case "PAID":
				return { label: "ACQUITTÉE", color: "text-green-600" };
			case "PENDING":
				return { label: "EN ATTENTE", color: "text-yellow-600" };
			case "CANCELED":
				return { label: "ANNULÉE", color: "text-red-600" };
			default:
				return { label: "INCONNU", color: "text-gray-500" };
		}
	};

	return (
		<div className="bg-white p-4 max-w-3xl mx-auto flex flex-col min-h-screen justify-between print:min-h-screen print:p-2 relative">
			{/* Filigrane démo */}
			{!patient?.email || (patient?.email && patient.email.includes('demo')) ? (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
					<div className="transform -rotate-45 text-gray-200 font-bold text-6xl opacity-30 select-none">
						MODE DÉMO
					</div>
				</div>
			) : null}
			
			{/* Partie haute */}
			<div className="flex-1 relative z-20">
				{/* En-tête */}
				<div className="flex justify-between items-start mb-16">
					{/* Colonne gauche : titre + logo + infos */}
					<div>
					{/* Ligne titre + logo */}
					<div className="flex items-center gap-4 mb-2 mt-6">
						<h1 className="text-2xl font-extrabold text-emerald-700">
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
						{osteopath?.name ? `${osteopath.name} - ` : ""}{osteopath?.professional_title || "Ostéopathe D.O."}
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

					{/* Colonne droite : info facture */}
					<div className="text-right mt-6">
						<h2 className="text-lg font-medium text-emerald-700 mb-1">
							NOTE D'HONORAIRES
						</h2>
						<p className="font-medium text-emerald-600">
							n° #{invoice.id.toString().padStart(4, "0")}
						</p>
						<p className="mt-4 text-gray-600 whitespace-nowrap">
							Date de consultation: {formattedDate}
						</p>
					</div>
				</div>

				{/* Infos patient + paiement */}
				<div className="grid grid-cols-2 gap-8 mb-6">
					<div>
						<h3 className="font-medium text-emerald-700 mb-3">
							Facturer à:
						</h3>
						<div className="border-l-4 border-emerald-200 pl-4 break-words">
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
						<h3 className="font-medium text-emerald-700 mb-3">
							Mode de règlement:
						</h3>
						<p className="font-medium text-gray-800">
							{getPaymentMethod(invoice.paymentMethod)}
						</p>
						{invoice.paymentStatus && (
							<p
								className={`${
									getPaymentStatusLabel(invoice.paymentStatus)
										.color
								} font-bold text-lg mt-2`}
							>
								{
									getPaymentStatusLabel(invoice.paymentStatus)
										.label
								}
							</p>
						)}
					</div>
				</div>

				{/* Tableau prestations */}
				<div className="rounded-lg border border-emerald-200 overflow-hidden mb-6">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-100">
								<th className="py-3 px-4 text-left text-emerald-700 font-semibold">
									Désignation
								</th>
								<th className="py-3 px-4 text-right text-emerald-700 font-semibold">
									Montant
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-t border-emerald-200">
								<td className="py-4 px-4 text-gray-700">
									Consultation d'ostéopathie
								</td>
								<td className="py-4 px-4 text-right text-emerald-700 font-bold">
									{formatAmount(invoice.amount)}
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr className="border-t border-emerald-200 bg-emerald-50/50">
								<td className="py-2 px-2 text-right text-emerald-700 font-medium">
									Total
								</td>
								<td className="py-2 px-2 text-right text-emerald-700 font-bold">
									{formatAmount(invoice.amount)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
			{/* Signature/tampon de l'ostéopathe */}
			{osteopath && (
				<div className="flex-1 flex justify-end">
					<div className="text-center">
						<p className="text-sm text-gray-600 mb-2">
							Signature et cachet du praticien
						</p>
						{osteopath.stampUrl ? (
							<div className="max-h-[120px] max-w-[200px] mx-auto">
								<img
									src={osteopath.stampUrl}
									alt="Signature/Tampon professionnel"
									className="max-h-[120px] w-auto object-contain"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.style.display = "none";
									}}
								/>
							</div>
						) : (
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[120px] min-w-[200px] flex items-center justify-center mx-auto">
								<p className="text-gray-400 text-sm text-center">
									Signature<br />
									{osteopath.professional_title || "Ostéopathe D.O."}
								</p>
							</div>
						)}
						<p className="text-sm text-gray-600 mt-2 font-medium">
							{osteopath.name}
						</p>
					</div>
				</div>
			)}
			{/* Footer Mentions */}
			<footer className="pt-6 mt-auto border-t border-gray-200">
				<h3 className="font-medium text-emerald-700 mb-2">
					Mentions obligatoires:
				</h3>
				<p className="text-gray-700 mb-3 font-medium">
					{invoice.tvaMotif ||
						"TVA non applicable - Article 261-4-1° du CGI"}
				</p>
				<p className="text-gray-600 mb-6">
					En votre aimable règlement à réception. Merci de votre
					confiance.
				</p>
			</footer>
		</div>
	);
};
