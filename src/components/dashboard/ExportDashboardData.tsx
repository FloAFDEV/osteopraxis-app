import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Calendar } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/services/api";
import { generateAccountingExport } from "@/services/export/invoice-export-service";
import {
	format,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
} from "date-fns";
import { fr } from "date-fns/locale";

type PeriodType = "month" | "quarter" | "year" | "custom";

export function ExportDashboardData() {
	const [exporting, setExporting] = useState(false);
	const [periodType, setPeriodType] = useState<PeriodType>("month");
	const [selectedMonth, setSelectedMonth] = useState(
		format(new Date(), "yyyy-MM"),
	);
	const [selectedYear, setSelectedYear] = useState(
		format(new Date(), "yyyy"),
	);

	const handleExportExcel = async () => {
		try {
			setExporting(true);
			toast.info("Génération de l'export Excel...");

			// Récupérer les données
			const [invoices, patients, osteopath, cabinets] = await Promise.all(
				[
					api.getInvoices(),
					api.getPatients(),
					api.getCurrentOsteopath(),
					api.getCabinets(),
				],
			);

			// Déterminer la période
			let startDate: Date;
			let endDate: Date;
			let periodLabel: string;

			if (periodType === "month") {
				const date = new Date(selectedMonth);
				startDate = startOfMonth(date);
				endDate = endOfMonth(date);
				periodLabel = format(date, "MMMM yyyy", { locale: fr });
			} else {
				const year = parseInt(selectedYear);
				startDate = startOfYear(new Date(year, 0, 1));
				endDate = endOfYear(new Date(year, 0, 1));
				periodLabel = selectedYear;
			}

			// Filtrer les factures par période
			const filteredInvoices = invoices.filter((inv) => {
				const invDate = new Date(inv.date);
				return invDate >= startDate && invDate <= endDate;
			});

			if (filteredInvoices.length === 0) {
				toast.warning("Aucune facture pour cette période");
				return;
			}

			// Créer une map des patients
			const patientMap = new Map(patients.map((p) => [p.id, p]));

			// Obtenir le premier cabinet (ou créer un cabinet par défaut)
			const cabinet = cabinets[0] || {
				id: 0,
				name: osteopath?.name || "Cabinet",
				address: "",
				phone: "",
				email: osteopath?.email || "",
			};

			// Générer l'export
			const blob = await generateAccountingExport(
				filteredInvoices,
				patientMap,
				periodLabel,
				osteopath,
				cabinet,
			);

			// Télécharger le fichier
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `export-comptable-${periodLabel.replace(/\s/g, "-")}.xlsx`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("Export Excel téléchargé avec succès");
		} catch (error) {
			console.error("Erreur export Excel:", error);
			toast.error("Erreur lors de l'export Excel");
		} finally {
			setExporting(false);
		}
	};

	const handleExportPDF = async () => {
		try {
			setExporting(true);
			toast.info("Génération de l'export PDF...");

			// TODO: Implémenter l'export PDF du dashboard
			// Pour l'instant, on montre juste un message
			toast.info("Export PDF en cours de développement");
		} catch (error) {
			console.error("Erreur export PDF:", error);
			toast.error("Erreur lors de l'export PDF");
		} finally {
			setExporting(false);
		}
	};

	// Générer la liste des 12 derniers mois
	const months = Array.from({ length: 12 }, (_, i) => {
		const date = new Date();
		date.setMonth(date.getMonth() - i);
		return {
			value: format(date, "yyyy-MM"),
			label: format(date, "MMMM yyyy", { locale: fr }),
		};
	});

	// Générer la liste des 5 dernières années
	const years = Array.from({ length: 5 }, (_, i) => {
		const year = new Date().getFullYear() - i;
		return {
			value: year.toString(),
			label: year.toString(),
		};
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Download className="h-5 w-5" />
					Exporter vos données
				</CardTitle>
				<CardDescription>
					Téléchargez vos statistiques et données comptables au format
					Excel ou PDF
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Sélection de période */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Type de période
						</label>
						<Select
							value={periodType}
							onValueChange={(value) =>
								setPeriodType(value as PeriodType)
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="month">Mensuel</SelectItem>
								<SelectItem value="year">Annuel</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{periodType === "month" && (
						<div className="space-y-2">
							<label className="text-sm font-medium">Mois</label>
							<Select
								value={selectedMonth}
								onValueChange={setSelectedMonth}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{months.map((month) => (
										<SelectItem
											key={month.value}
											value={month.value}
										>
											{month.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{periodType === "year" && (
						<div className="space-y-2">
							<label className="text-sm font-medium">Année</label>
							<Select
								value={selectedYear}
								onValueChange={setSelectedYear}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{years.map((year) => (
										<SelectItem
											key={year.value}
											value={year.value}
										>
											{year.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>

				{/* Boutons d'export */}
				<div className="flex flex-col sm:flex-row gap-3 pt-4">
					<Button
						onClick={handleExportExcel}
						disabled={exporting}
						className="flex-1"
						variant="default"
					>
						<FileSpreadsheet className="h-4 w-4 mr-2" />
						{exporting ? "Export en cours..." : "Exporter en Excel"}
					</Button>
					<Button
						onClick={handleExportPDF}
						disabled={exporting}
						className="flex-1"
						variant="outline"
					>
						<FileText className="h-4 w-4 mr-2" />
						Exporter en PDF
					</Button>
				</div>

				<p className="text-sm text-muted-foreground mt-2">
					Les exports incluent votre logo et signature si configurés
					dans vos paramètres
				</p>
			</CardContent>
		</Card>
	);
}
