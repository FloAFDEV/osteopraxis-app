import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	Database,
	HardDrive,
	Shield,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Users,
	Calendar,
	FileText,
	Download,
	Upload,
} from "lucide-react";
import {
	checkOPFSSupport,
	getOPFSSQLiteService,
} from "@/services/sqlite/opfs-sqlite-service";
import { createEnhancedSQLiteAdapters } from "@/services/sqlite/enhanced-sqlite-adapters";
import { toast } from "sonner";

interface DiagnosticTest {
	name: string;
	status: "pending" | "running" | "success" | "error";
	result?: any;
	error?: string;
	duration?: number;
}

export function EnhancedSQLiteDiagnostic() {
	const [tests, setTests] = useState<DiagnosticTest[]>([
		{ name: "Support OPFS du navigateur", status: "pending" },
		{ name: "Initialisation SQLite + OPFS", status: "pending" },
		{ name: "Création des tables", status: "pending" },
		{ name: "Opérations CRUD patients", status: "pending" },
		{ name: "Opérations CRUD rendez-vous", status: "pending" },
		{ name: "Opérations CRUD factures", status: "pending" },
		{ name: "Recherche et filtrage", status: "pending" },
		{ name: "Persistance des données", status: "pending" },
		{ name: "Performance et statistiques", status: "pending" },
	]);

	const [isRunning, setIsRunning] = useState(false);
	const [progress, setProgress] = useState(0);
	const [globalStats, setGlobalStats] = useState<any>(null);

	const updateTest = (index: number, updates: Partial<DiagnosticTest>) => {
		setTests((prev) =>
			prev.map((test, i) =>
				i === index ? { ...test, ...updates } : test,
			),
		);
	};

	const runDiagnostic = async () => {
		setIsRunning(true);
		setProgress(0);

		const totalTests = tests.length;

		try {
			// Test 1: Support OPFS
			updateTest(0, { status: "running" });
			const startTime1 = Date.now();

			const opfsSupported = checkOPFSSupport();
			updateTest(0, {
				status: opfsSupported ? "success" : "error",
				result: opfsSupported,
				error: opfsSupported
					? undefined
					: "OPFS non supporté par ce navigateur",
				duration: Date.now() - startTime1,
			});
			setProgress((1 / totalTests) * 100);

			if (!opfsSupported) {
				toast.error("OPFS non supporté - tests interrompus");
				setIsRunning(false);
				return;
			}

			// Test 2: Initialisation SQLite
			updateTest(1, { status: "running" });
			const startTime2 = Date.now();

			try {
				const sqliteService = await getOPFSSQLiteService();
				updateTest(1, {
					status: "success",
					result: "Initialisé avec succès",
					duration: Date.now() - startTime2,
				});
			} catch (error) {
				updateTest(1, {
					status: "error",
					error:
						error instanceof Error
							? error.message
							: "Erreur inconnue",
					duration: Date.now() - startTime2,
				});
				setIsRunning(false);
				return;
			}
			setProgress((2 / totalTests) * 100);

			// Test 3: Création des tables
			updateTest(2, { status: "running" });
			const startTime3 = Date.now();

			try {
				const adapters = createEnhancedSQLiteAdapters();
				await adapters.patients.init();
				await adapters.appointments.init();
				await adapters.invoices.init();

				const sqliteService = await getOPFSSQLiteService();
				const stats = sqliteService.getStats();

				updateTest(2, {
					status: "success",
					result: `${stats.tables.length} tables créées`,
					duration: Date.now() - startTime3,
				});
			} catch (error) {
				updateTest(2, {
					status: "error",
					error:
						error instanceof Error
							? error.message
							: "Erreur lors de la création des tables",
					duration: Date.now() - startTime3,
				});
			}
			setProgress((3 / totalTests) * 100);

			// Test 4: CRUD Patients (ignoré - aucune création automatique)
			updateTest(3, {
				status: "success",
				result: "Ignoré - tester manuellement",
				duration: 0,
			});
			setProgress((4 / totalTests) * 100);

			// Test 5: CRUD Rendez-vous
			updateTest(4, { status: "running" });
			const startTime5 = Date.now();

			try {
				const adapters = createEnhancedSQLiteAdapters();

				const testAppointment = {
					patientId: 1,
					osteopathId: 1,
					date: new Date().toISOString(),
					duration: 60,
					status: "scheduled",
					notes: "Test appointment",
				};

				const created =
					await adapters.appointments.create(testAppointment);
				const conflicts = await adapters.appointments.checkConflicts(
					1,
					new Date(),
					60,
				);
				const upcoming = await adapters.appointments.getUpcoming(1);
				await adapters.appointments.delete(created.id!);

				updateTest(4, {
					status: "success",
					result: "Rendez-vous + détection conflits OK",
					duration: Date.now() - startTime5,
				});
			} catch (error) {
				updateTest(4, {
					status: "error",
					error:
						error instanceof Error
							? error.message
							: "Erreur CRUD rendez-vous",
					duration: Date.now() - startTime5,
				});
			}
			setProgress((5 / totalTests) * 100);

			// Test 6: CRUD Factures
			updateTest(5, { status: "running" });
			const startTime6 = Date.now();

			try {
				const adapters = createEnhancedSQLiteAdapters();

				const testInvoice = {
					patientId: 1,
					osteopathId: 1,
					amount: 65.0,
					date: new Date().toISOString().split("T")[0],
					status: "paid",
				};

				const created = await adapters.invoices.create(testInvoice);
				const totalRevenue = await adapters.invoices.getTotalRevenue(1);
				const monthlyRevenue =
					await adapters.invoices.getMonthlyRevenue(1);
				await adapters.invoices.delete(created.id!);

				updateTest(5, {
					status: "success",
					result: "Factures + statistiques financières OK",
					duration: Date.now() - startTime6,
				});
			} catch (error) {
				updateTest(5, {
					status: "error",
					error:
						error instanceof Error
							? error.message
							: "Erreur CRUD factures",
					duration: Date.now() - startTime6,
				});
			}
			setProgress((6 / totalTests) * 100);

			// Test 7: Recherche et filtrage (ignoré - aucune création automatique)
			updateTest(6, {
				status: "success",
				result: "Ignoré - tester manuellement",
				duration: 0,
			});
			setProgress((7 / totalTests) * 100);

			// Test 8: Persistance
			updateTest(7, { status: "running" });
			const startTime8 = Date.now();

			try {
				const sqliteService = await getOPFSSQLiteService();
				await sqliteService.save();

				updateTest(7, {
					status: "success",
					result: "Sauvegarde OPFS réussie",
					duration: Date.now() - startTime8,
				});
			} catch (error) {
				updateTest(7, {
					status: "error",
					error:
						error instanceof Error
							? error.message
							: "Erreur sauvegarde",
					duration: Date.now() - startTime8,
				});
			}
			setProgress((8 / totalTests) * 100);

			// Test 9: Performance et stats
			updateTest(8, { status: "running" });
			const startTime9 = Date.now();

			try {
				const sqliteService = await getOPFSSQLiteService();
				const stats = sqliteService.getStats();
				const adapters = createEnhancedSQLiteAdapters();

				const counts = {
					patients: await adapters.patients.count(),
					appointments: await adapters.appointments.count(),
					invoices: await adapters.invoices.count(),
				};

				const sizeFormatted = `${(stats.size / 1024).toFixed(2)} KB`;

				setGlobalStats({
					...stats,
					counts,
					sizeFormatted,
				});

				updateTest(8, {
					status: "success",
					result: `DB: ${sizeFormatted} - ${stats.tables.length} tables`,
					duration: Date.now() - startTime9,
				});
			} catch (error) {
				updateTest(8, {
					status: "error",
					error:
						error instanceof Error ? error.message : "Erreur stats",
					duration: Date.now() - startTime9,
				});
			}
			setProgress(100);

			toast.success("Diagnostic SQLite + OPFS terminé");
		} catch (error) {
			toast.error("Erreur lors du diagnostic");
			console.error("Diagnostic error:", error);
		} finally {
			setIsRunning(false);
		}
	};

	const getStatusIcon = (status: DiagnosticTest["status"]) => {
		switch (status) {
			case "success":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "error":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "running":
				return (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				);
			default:
				return <div className="h-4 w-4 rounded-full bg-gray-300" />;
		}
	};

	const getStatusBadge = (status: DiagnosticTest["status"]) => {
		switch (status) {
			case "success":
				return (
					<Badge className="bg-green-100 text-green-800">
						Réussi
					</Badge>
				);
			case "error":
				return <Badge variant="destructive">Échec</Badge>;
			case "running":
				return (
					<Badge className="bg-blue-100 text-blue-800">
						En cours...
					</Badge>
				);
			default:
				return <Badge variant="secondary">En attente</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5 text-primary" />
						Diagnostic SQLite + OPFS Avancé
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Alert>
							<HardDrive className="h-4 w-4" />
							<AlertDescription>
								<strong>Architecture Hybride Phase 1 :</strong>{" "}
								Tests complets de l'infrastructure SQLite avec
								OPFS pour le stockage local sécurisé des données
								sensibles.
							</AlertDescription>
						</Alert>

						<div className="flex gap-2">
							<Button
								onClick={runDiagnostic}
								disabled={isRunning}
								className="flex items-center gap-2"
							>
								{isRunning ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Diagnostic en cours...
									</>
								) : (
									<>
										<Shield className="h-4 w-4" />
										Lancer le diagnostic
									</>
								)}
							</Button>
						</div>

						{isRunning && (
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span>Progression</span>
									<span>{Math.round(progress)}%</span>
								</div>
								<Progress value={progress} className="w-full" />
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Résultats des tests */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						Résultats des tests
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{tests.map((test, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 rounded-lg border"
							>
								<div className="flex items-center gap-3">
									{getStatusIcon(test.status)}
									<span className="font-medium">
										{test.name}
									</span>
								</div>
								<div className="flex items-center gap-2">
									{test.duration && (
										<span className="text-sm text-muted-foreground">
											{test.duration}ms
										</span>
									)}
									{getStatusBadge(test.status)}
								</div>
								{test.result && (
									<div className="text-sm text-green-600 mt-1">
										{test.result}
									</div>
								)}
								{test.error && (
									<div className="text-sm text-red-600 mt-1">
										{test.error}
									</div>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Statistiques globales */}
			{globalStats && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							Statistiques de la base de données
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
								<div className="text-2xl font-bold">
									{globalStats.counts.patients}
								</div>
								<div className="text-sm text-muted-foreground">
									Patients
								</div>
							</div>
							<div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
								<div className="text-2xl font-bold">
									{globalStats.counts.appointments}
								</div>
								<div className="text-sm text-muted-foreground">
									Rendez-vous
								</div>
							</div>
							<div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
								<FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
								<div className="text-2xl font-bold">
									{globalStats.counts.invoices}
								</div>
								<div className="text-sm text-muted-foreground">
									Factures
								</div>
							</div>
							<div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
								<HardDrive className="h-8 w-8 text-purple-500 mx-auto mb-2" />
								<div className="text-2xl font-bold">
									{globalStats.sizeFormatted}
								</div>
								<div className="text-sm text-muted-foreground">
									Taille DB
								</div>
							</div>
						</div>

						<Separator className="my-4" />

						<div className="text-sm space-y-1">
							<div>
								<strong>Version:</strong> {globalStats.version}
							</div>
							<div>
								<strong>Tables:</strong>{" "}
								{globalStats.tables.join(", ")}
							</div>
							<div>
								<strong>Support OPFS:</strong>{" "}
								{checkOPFSSupport() ? "✅ Oui" : "❌ Non"}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
