import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeletedRecords } from "@/hooks/useDeletedRecords";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RotateCcw, Trash2, User, Calendar, FileText } from "lucide-react";

export const DeletedRecordsManager = () => {
	const {
		deletedPatients,
		deletedAppointments,
		deletedInvoices,
		isLoading,
		restoreRecord,
		softDeleteRecord,
		refreshDeletedRecords,
	} = useDeletedRecords();

	const handleRestore = async (tableName: string, recordId: string) => {
		await restoreRecord(tableName, recordId);
	};

	const handlePermanentDelete = async (
		tableName: string,
		recordId: string,
	) => {
		if (
			window.confirm(
				"Êtes-vous sûr de vouloir supprimer définitivement cet élément ?",
			)
		) {
			await softDeleteRecord(tableName, recordId);
		}
	};

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), "dd/MM/yyyy à HH:mm", {
			locale: fr,
		});
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Gestion des données supprimées
					</h2>
					<p className="text-muted-foreground">
						Restaurez ou supprimez définitivement les données
						supprimées par erreur
					</p>
				</div>
				<Button onClick={refreshDeletedRecords} variant="outline">
					Actualiser
				</Button>
			</div>

			<Tabs defaultValue="patients" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger
						value="patients"
						className="flex items-center gap-2"
					>
						<User className="h-4 w-4" />
						Patients ({deletedPatients.length})
					</TabsTrigger>
					<TabsTrigger
						value="appointments"
						className="flex items-center gap-2"
					>
						<Calendar className="h-4 w-4" />
						Rendez-vous ({deletedAppointments.length})
					</TabsTrigger>
					<TabsTrigger
						value="invoices"
						className="flex items-center gap-2"
					>
						<FileText className="h-4 w-4" />
						Factures ({deletedInvoices.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="patients">
					<Card>
						<CardHeader>
							<CardTitle>Patients supprimés</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{deletedPatients.length === 0 ? (
									<p className="text-muted-foreground">
										Aucun patient supprimé
									</p>
								) : (
									deletedPatients.map((patient) => (
										<div
											key={patient.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex-1">
												<h4 className="font-medium">
													{patient.firstName}{" "}
													{patient.lastName}
												</h4>
												<p className="text-sm text-muted-foreground">
													{patient.email} • ID:{" "}
													{patient.id}
												</p>
												<p className="text-sm text-muted-foreground">
													Supprimé le{" "}
													{formatDate(
														patient.deleted_at,
													)}
												</p>
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleRestore(
															"Patient",
															patient.id.toString(),
														)
													}
												>
													<RotateCcw className="h-4 w-4 mr-2" />
													Restaurer
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() =>
														handlePermanentDelete(
															"Patient",
															patient.id.toString(),
														)
													}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Supprimer définitivement
												</Button>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="appointments">
					<Card>
						<CardHeader>
							<CardTitle>Rendez-vous supprimés</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{deletedAppointments.length === 0 ? (
									<p className="text-muted-foreground">
										Aucun rendez-vous supprimé
									</p>
								) : (
									deletedAppointments.map((appointment) => (
										<div
											key={appointment.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex-1">
												<h4 className="font-medium">
													{appointment.reason}
												</h4>
												<p className="text-sm text-muted-foreground">
													{formatDate(
														appointment.date,
													)}{" "}
													• Patient ID:{" "}
													{appointment.patientId}
												</p>
												<p className="text-sm text-muted-foreground">
													Supprimé le{" "}
													{formatDate(
														appointment.deleted_at,
													)}
												</p>
												<Badge
													variant="secondary"
													className="mt-1"
												>
													{appointment.status}
												</Badge>
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleRestore(
															"Appointment",
															appointment.id.toString(),
														)
													}
												>
													<RotateCcw className="h-4 w-4 mr-2" />
													Restaurer
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() =>
														handlePermanentDelete(
															"Appointment",
															appointment.id.toString(),
														)
													}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Supprimer définitivement
												</Button>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="invoices">
					<Card>
						<CardHeader>
							<CardTitle>Factures supprimées</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{deletedInvoices.length === 0 ? (
									<p className="text-muted-foreground">
										Aucune facture supprimée
									</p>
								) : (
									deletedInvoices.map((invoice) => (
										<div
											key={invoice.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex-1">
												<h4 className="font-medium">
													Facture #{invoice.id}
												</h4>
												<p className="text-sm text-muted-foreground">
													{invoice.amount}€ •{" "}
													{formatDate(invoice.date)} •
													Patient ID:{" "}
													{invoice.patientId}
												</p>
												<p className="text-sm text-muted-foreground">
													Supprimé le{" "}
													{formatDate(
														invoice.deleted_at,
													)}
												</p>
												<Badge
													variant="secondary"
													className="mt-1"
												>
													{invoice.paymentStatus}
												</Badge>
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleRestore(
															"Invoice",
															invoice.id.toString(),
														)
													}
												>
													<RotateCcw className="h-4 w-4 mr-2" />
													Restaurer
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() =>
														handlePermanentDelete(
															"Invoice",
															invoice.id.toString(),
														)
													}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Supprimer définitivement
												</Button>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};
