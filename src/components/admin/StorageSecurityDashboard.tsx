/**
 * 🛡️ Tableau de bord de sécurité du stockage
 *
 * Interface d'administration pour surveiller la conformité HDS/Non-HDS
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Shield,
	ShieldAlert,
	ShieldCheck,
	Database,
	Cloud,
	HardDrive,
	RefreshCw,
	AlertTriangle,
	CheckCircle,
	XCircle,
} from "lucide-react";
import {
	storageDiagnostic,
	type StorageDiagnostic,
} from "@/services/storage/storage-diagnostic";
import {
	DATA_CLASSIFICATION,
	HDS_SECURITY_CONFIG,
} from "@/services/storage/data-classification";

export const StorageSecurityDashboard: React.FC = () => {
	const [diagnostic, setDiagnostic] = useState<StorageDiagnostic | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	const runDiagnostic = async () => {
		setIsLoading(true);
		try {
			const result = await storageDiagnostic.runFullDiagnostic();
			setDiagnostic(result);
		} catch (error) {
			console.error("Erreur diagnostic:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		runDiagnostic();
	}, []);

	const getSecurityStatusIcon = (secure: boolean) => {
		return secure ? (
			<ShieldCheck className="h-5 w-5 text-green-500" />
		) : (
			<ShieldAlert className="h-5 w-5 text-red-500" />
		);
	};

	const getStorageTypeIcon = (type: string) => {
		switch (type) {
			case "local_persistent":
				return <HardDrive className="h-4 w-4 text-blue-500" />;
			case "supabase_cloud":
				return <Cloud className="h-4 w-4 text-purple-500" />;
			case "demo_session":
				return <Database className="h-4 w-4 text-gray-500" />;
			default:
				return <XCircle className="h-4 w-4 text-red-500" />;
		}
	};

	if (!diagnostic) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Sécurité du Stockage
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Button onClick={runDiagnostic} disabled={isLoading}>
						{isLoading ? (
							<RefreshCw className="h-4 w-4 animate-spin" />
						) : (
							"Lancer le diagnostic"
						)}
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* En-tête avec statut global */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Sécurité du Stockage
							<Badge
								variant={
									diagnostic.mode === "demo"
										? "secondary"
										: "default"
								}
							>
								{diagnostic.mode === "demo"
									? "Mode Démo"
									: "Mode Connecté"}
							</Badge>
						</div>
						<Button
							onClick={runDiagnostic}
							disabled={isLoading}
							size="sm"
						>
							{isLoading ? (
								<RefreshCw className="h-4 w-4 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4" />
							)}
							Actualiser
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="flex items-center gap-2">
							{getSecurityStatusIcon(
								diagnostic.security.local_encryption,
							)}
							<span className="text-sm">HDS Local</span>
						</div>
						<div className="flex items-center gap-2">
							{getSecurityStatusIcon(
								!diagnostic.security.demo_isolation,
							)}
							<span className="text-sm">Non-HDS Cloud</span>
						</div>
						<div className="flex items-center gap-2">
							{getSecurityStatusIcon(
								diagnostic.security.no_hds_leakage,
							)}
							<span className="text-sm">Aucune Fuite HDS</span>
						</div>
						<div className="flex items-center gap-2">
							{getSecurityStatusIcon(
								diagnostic.security.demo_isolation,
							)}
							<span className="text-sm">Démo Isolé</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Violations de sécurité */}
			{!diagnostic.security.no_hds_leakage && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						<div className="space-y-2">
							<p className="font-semibold">
								Violations de sécurité détectées :
							</p>
							<div className="text-sm">
								• <strong>HDS Security</strong>: Fuite
								potentielle de données sensibles détectée
							</div>
						</div>
					</AlertDescription>
				</Alert>
			)}

			<Tabs defaultValue="services" className="w-full">
				<TabsList>
					<TabsTrigger value="services">Services</TabsTrigger>
					<TabsTrigger value="classification">
						Classification
					</TabsTrigger>
					<TabsTrigger value="security">Sécurité</TabsTrigger>
					<TabsTrigger value="recommendations">
						Recommandations
					</TabsTrigger>
				</TabsList>

				<TabsContent value="services" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Services HDS */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HardDrive className="h-5 w-5 text-red-500" />
									Services HDS (Sensibles)
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm">
											Type de stockage:
										</span>
										<div className="flex items-center gap-2">
											{getStorageTypeIcon(
												"Local sécurisé",
											)}
											<span className="text-sm font-medium">
												Local sécurisé
											</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">
											Accessibilité:
										</span>
										{diagnostic.tests
											.hds_secure_write_read ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<XCircle className="h-4 w-4 text-red-500" />
										)}
									</div>
									<div className="mt-3">
										<p className="text-sm font-medium mb-2">
											Entités concernées:
										</p>
										<div className="flex flex-wrap gap-1">
											{diagnostic.routing.hds_to_local.map(
												(entity) => (
													<Badge
														key={entity}
														variant="destructive"
														className="text-sm"
													>
														{entity}
													</Badge>
												),
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Services Non-HDS */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Cloud className="h-5 w-5 text-blue-500" />
									Services Non-HDS
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm">
											Type de stockage:
										</span>
										<div className="flex items-center gap-2">
											{getStorageTypeIcon(
												"Cloud Supabase",
											)}
											<span className="text-sm font-medium">
												Cloud Supabase
											</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">
											Accessibilité:
										</span>
										{diagnostic.tests
											.nonhds_cloud_write_read ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<XCircle className="h-4 w-4 text-red-500" />
										)}
									</div>
									<div className="mt-3">
										<p className="text-sm font-medium mb-2">
											Entités concernées:
										</p>
										<div className="flex flex-wrap gap-1">
											{diagnostic.routing.nonhds_to_supabase.map(
												(entity) => (
													<Badge
														key={entity}
														variant="secondary"
														className="text-sm"
													>
														{entity}
													</Badge>
												),
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="classification" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Classification HDS */}
						<Card>
							<CardHeader>
								<CardTitle className="text-red-600">
									🔴 Données HDS (Sensibles)
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<p className="text-sm text-gray-600">
										Stockage local persistant obligatoire
									</p>
									<div className="space-y-2">
										{DATA_CLASSIFICATION.HDS.map(
											(entity) => (
												<div
													key={entity}
													className="flex items-center justify-between p-2 bg-red-50 rounded"
												>
													<span className="text-sm font-medium">
														{entity}
													</span>
													<HardDrive className="h-4 w-4 text-red-500" />
												</div>
											),
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Classification Non-HDS */}
						<Card>
							<CardHeader>
								<CardTitle className="text-green-600">
									🟢 Données Non-HDS
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<p className="text-sm text-gray-600">
										Stockage Supabase autorisé
									</p>
									<div className="space-y-2 max-h-64 overflow-y-auto">
										{DATA_CLASSIFICATION.NON_HDS.map(
											(entity) => (
												<div
													key={entity}
													className="flex items-center justify-between p-2 bg-green-50 rounded"
												>
													<span className="text-sm font-medium">
														{entity}
													</span>
													<Cloud className="h-4 w-4 text-green-500" />
												</div>
											),
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="security" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Configuration de Sécurité HDS</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<h4 className="font-medium">
											Chiffrement
										</h4>
										<div className="text-sm space-y-1">
											<p>
												• Activé:{" "}
												{HDS_SECURITY_CONFIG.encryption
													.enabled
													? "✅"
													: "❌"}
											</p>
											<p>
												• Algorithme:{" "}
												{
													HDS_SECURITY_CONFIG
														.encryption.algorithm
												}
											</p>
											<p>
												• Dérivation:{" "}
												{
													HDS_SECURITY_CONFIG
														.encryption
														.keyDerivation
												}
											</p>
										</div>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Accès</h4>
										<div className="text-sm space-y-1">
											<p>
												• Local uniquement:{" "}
												{HDS_SECURITY_CONFIG.access
													.localOnly
													? "✅"
													: "❌"}
											</p>
											<p>
												• Pas de sync cloud:{" "}
												{HDS_SECURITY_CONFIG.access
													.noCloudSync
													? "✅"
													: "❌"}
											</p>
											<p>
												• Auth requise:{" "}
												{HDS_SECURITY_CONFIG.access
													.requiresAuthentication
													? "✅"
													: "❌"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="recommendations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recommandations</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{!diagnostic.security.no_hds_leakage && (
									<Alert variant="destructive">
										<AlertDescription>
											🚨 CRITIQUE: Fuite possible de
											données HDS vers Supabase
										</AlertDescription>
									</Alert>
								)}
								{diagnostic.mode === "demo" &&
									!diagnostic.security.demo_isolation && (
										<Alert variant="default">
											<AlertDescription>
												⚠️ Mode démo non isolé
											</AlertDescription>
										</Alert>
									)}
								{diagnostic.performance.cloud_latency >
									5000 && (
									<Alert variant="default">
										<AlertDescription>
											⚠️ Latence cloud élevée
										</AlertDescription>
									</Alert>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};
