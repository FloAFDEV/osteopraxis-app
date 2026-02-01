import { Cabinet, Invoice, Osteopath, Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useDemo } from "@/contexts/DemoContext";

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
	// Détection du mode démo via contexte sécurisé
	const { isDemoMode } = useDemo();
	
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
			return { label: "ACQUITTÉE", color: "text-indigo-600" };
		case "PENDING":
			return { label: "EN ATTENTE", color: "text-amber-600" };
		case "CANCELED":
			return { label: "ANNULÉE", color: "text-rose-600" };
		default:
			return { label: "INCONNU", color: "text-gray-500" };
	}
};

	return (
		<div className="bg-white p-4 max-w-3xl mx-auto flex flex-col min-h-screen justify-between print:min-h-screen print:p-2 relative">
			{/* Bandeau rouge + Watermark MODE DÉMO */}
			{isDemoMode && (
				<>
					{/* Bandeau rouge en haut */}
					<div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-3 font-bold text-lg z-50 print:block">
						DOCUMENT DE DÉMONSTRATION - NON VALABLE
					</div>
					
					{/* Filigrane central */}
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
						<div className="text-red-600 text-7xl font-bold opacity-40 rotate-[-45deg] select-none whitespace-nowrap">
							MODE DÉMO<br/>NON VALABLE
						</div>
					</div>
				</>
			)}
			
			{/* Partie haute */}
			<div className="flex-1 relative z-20" style={{ marginTop: isDemoMode ? '3rem' : '0' }}>
				{/* En-tête */}
				<div className="flex justify-between items-start mb-16">
					{/* Colonne gauche : titre + logo + infos */}
					<div>
					{/* Ligne titre + logo */}
					<div className="flex items-center gap-4 mb-2 mt-6">
						<h1 className="text-2xl font-extrabold text-indigo-700">
							{cabinet?.name || "OstéoPraxis"}
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
						<h2 className="text-lg font-medium text-indigo-700 mb-1">
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
						<h3 className="font-medium text-indigo-700 mb-3">
							Facturer à:
						</h3>
						<div className="border-l-4 border-gray-300 pl-4 break-words">
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
						<h3 className="font-medium text-indigo-700 mb-3">
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
				<div className="rounded-lg border border-gray-300 overflow-hidden mb-6">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-100">
								<th className="py-3 px-4 text-left text-indigo-700 font-semibold">
									Désignation
								</th>
								<th className="py-3 px-4 text-right text-indigo-700 font-semibold">
									Montant
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-t border-gray-300">
								<td className="py-4 px-4 text-gray-700">
									Consultation d'ostéopathie
								</td>
								<td className="py-4 px-4 text-right text-indigo-700 font-bold">
									{formatAmount(invoice.amount)}
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr className="border-t border-gray-300 bg-gray-50/50">
								<td className="py-2 px-2 text-right text-indigo-700 font-medium">
									Total
								</td>
								<td className="py-2 px-2 text-right text-indigo-700 font-bold">
									{formatAmount(invoice.amount)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
			{/* Section signature/tampon et logo */}
			<div className="flex justify-between items-start mt-6">
				{/* Logo du cabinet en bas si disponible */}
				{cabinet?.logoUrl && (
					<div className="flex-1">
						<img
							src={cabinet.logoUrl}
							alt="Logo du cabinet"
							className="max-h-[100px] w-auto object-contain"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
							}}
						/>
					</div>
				)}
				
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
			</div>
			{/* Footer Mentions */}
			<footer className="pt-6 mt-auto border-t border-gray-200">
				<h3 className="font-medium text-indigo-700 mb-2">
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
