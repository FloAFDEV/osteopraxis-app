import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Download,
	Upload,
	HardDrive,
	Clock,
	Shield,
	AlertTriangle,
} from "lucide-react";
import {
	exportBackup,
	getLastBackupDate,
	getBackupReminderDays,
	setBackupReminderDays,
	checkBackupReminder,
} from "@/services/backup-service";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Panneau de configuration des sauvegardes
 *
 * Affiche les informations de sauvegarde et permet de configurer les rappels
 */
export function BackupSettingsPanel() {
	const [isExporting, setIsExporting] = useState(false);
	const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
	const [reminderDays, setReminderDays] = useState<number>(14);
	const [backupStatus, setBackupStatus] = useState<{
		shouldRemind: boolean;
		daysSinceLastBackup: number | null;
	}>({ shouldRemind: false, daysSinceLastBackup: null });

	useEffect(() => {
		setLastBackupDate(getLastBackupDate());
		setReminderDays(getBackupReminderDays());
		setBackupStatus(checkBackupReminder());
	}, []);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await exportBackup();
			toast.success("Sauvegarde téléchargée avec succès !");
			// Mettre à jour les états
			setLastBackupDate(new Date());
			setBackupStatus({ shouldRemind: false, daysSinceLastBackup: 0 });
		} catch (error) {
			toast.error("Erreur lors de la sauvegarde");
		} finally {
			setIsExporting(false);
		}
	};

	const handleReminderChange = (value: string) => {
		const days = parseInt(value, 10) as 7 | 14 | 30;
		setBackupReminderDays(days);
		setReminderDays(days);
		toast.success(`Rappel configuré tous les ${days} jours`);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
						<HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<CardTitle>Sauvegarde des données</CardTitle>
						<CardDescription>
							Exportez vos données locales pour les conserver en
							sécurité
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Avertissement important */}
				<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
					<div className="flex gap-3">
						<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
						<div className="text-sm text-amber-800 dark:text-amber-200">
							<p className="font-medium mb-1">Important</p>
							<p>
								Vos données sont stockées localement sur cet
								appareil. En cas de suppression du navigateur,
								nettoyage des données ou changement
								d'ordinateur, vos données seront perdues si vous
								n'avez pas effectué de sauvegarde.
							</p>
						</div>
					</div>
				</div>

				{/* Statut de la dernière sauvegarde */}
				<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
					<div className="flex items-center gap-3">
						<Clock className="h-5 w-5 text-slate-500" />
						<div>
							<p className="font-medium">Dernière sauvegarde</p>
							<p className="text-sm text-muted-foreground">
								{lastBackupDate
									? formatDistanceToNow(lastBackupDate, {
											addSuffix: true,
											locale: fr,
										})
									: "Jamais effectuée"}
							</p>
						</div>
					</div>

					{backupStatus.shouldRemind && (
						<span className="px-2 py-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full">
							Sauvegarde recommandée
						</span>
					)}
				</div>

				{/* Bouton d'export */}
				<div className="flex flex-col sm:flex-row gap-4">
					<Button
						onClick={handleExport}
						disabled={isExporting}
						className="flex-1 gap-2"
					>
						<Download className="h-4 w-4" />
						{isExporting
							? "Export en cours..."
							: "Télécharger une sauvegarde"}
					</Button>
				</div>

				{/* Configuration du rappel */}
				<div className="space-y-3 pt-4 border-t">
					<Label
						htmlFor="reminder-select"
						className="flex items-center gap-2"
					>
						<Shield className="h-4 w-4 text-indigo-500" />
						Rappel de sauvegarde
					</Label>
					<Select
						value={reminderDays.toString()}
						onValueChange={handleReminderChange}
					>
						<SelectTrigger
							id="reminder-select"
							className="w-full sm:w-[200px]"
						>
							<SelectValue placeholder="Fréquence de rappel" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Tous les 7 jours</SelectItem>
							<SelectItem value="14">
								Tous les 14 jours
							</SelectItem>
							<SelectItem value="30">
								Tous les 30 jours
							</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">
						Un rappel s'affichera sur le tableau de bord si vous
						n'avez pas effectué de sauvegarde depuis le délai
						configuré.
					</p>
				</div>

				{/* Info sur les données sauvegardées */}
				<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
						Données incluses dans la sauvegarde :
					</h4>
					<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
						<li>- Tous vos patients et leurs dossiers</li>
						<li>- Tous vos rendez-vous</li>
						<li>- Toutes vos factures</li>
						<li>- Les informations de votre cabinet</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
