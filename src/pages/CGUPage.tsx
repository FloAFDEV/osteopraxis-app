import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	FileText,
	Database,
	Shield,
	AlertTriangle,
	Download,
	Trash2,
	Stethoscope,
	Scale,
	RefreshCw,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const CGUPage = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-background">
			<div className="container max-w-4xl mx-auto py-8 px-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate(-1)}
					className="mb-6"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour
				</Button>

				<div className="space-y-8">
					<div className="text-center">
						<FileText className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
						<h1 className="text-3xl font-bold mb-2">
							Conditions Générales d'Utilisation
						</h1>
						<p className="text-muted-foreground">
							Dernière mise à jour :{" "}
							{new Date().toLocaleDateString("fr-FR", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>

					{/* Section 1: Objet */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
								<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<h2 className="text-xl font-semibold">1. Objet</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>
								Les présentes Conditions Générales d'Utilisation
								(CGU) régissent l'utilisation du logiciel{" "}
								<strong>OstéoPraxis</strong>.
							</p>
							<p>
								OstéoPraxis est un{" "}
								<strong>outil de gestion local</strong> destiné
								aux professionnels de santé, fourni{" "}
								<strong>en l'état</strong>, sans garantie de
								service continu.
							</p>
							<p>
								L'utilisation du logiciel implique l'acceptation
								pleine et entière des présentes CGU.
							</p>
						</div>
					</section>

					{/* Section 2: Accès au service */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
								<Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<h2 className="text-xl font-semibold">
								2. Accès au service
							</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>Le logiciel propose plusieurs modes d'accès :</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									<strong>Mode démo gratuit</strong> : Accès
									temporaire pour découvrir les
									fonctionnalités
								</li>
								<li>
									<strong>Mode inscrit</strong> : Accès
									complet après création d'un compte
								</li>
							</ul>
							<p className="mt-4">
								L'accès au logiciel est fourni{" "}
								<strong>sans engagement</strong>. Le paiement
								unique de 49€ à vie n'est pas obligatoire pour
								utiliser les fonctionnalités de base.
							</p>
							<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
								<p className="text-blue-800 dark:text-blue-200">
									L'accès au logiciel peut être interrompu
									volontairement par l'utilisateur à tout
									moment.
								</p>
							</div>
						</div>
					</section>

					{/* Section 3: Données & stockage - SECTION CLÉ */}
					<section className="bg-card rounded-lg border p-6 border-amber-300 dark:border-amber-700">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
								<Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
							</div>
							<h2 className="text-xl font-semibold">
								3. Données & Stockage
							</h2>
							<span className="px-2 py-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded">
								IMPORTANT
							</span>
						</div>
						<div className="space-y-4 text-muted-foreground">
							<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
								<p className="font-bold text-amber-900 dark:text-amber-100 text-lg mb-2">
									Les données sont stockées EXCLUSIVEMENT en
									local
								</p>
								<p className="text-amber-800 dark:text-amber-200">
									Toutes vos données métier (patients,
									dossiers, factures) sont stockées dans la
									base IndexedDB de votre navigateur, sur
									votre appareil uniquement.
								</p>
							</div>

							<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
								<p className="font-medium text-red-800 dark:text-red-200 mb-2">
									L'éditeur :
								</p>
								<ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
									<li>
										N'a <strong>aucun accès</strong> à vos
										données
									</li>
									<li>
										Ne peut{" "}
										<strong>
											ni les consulter, ni les restaurer
										</strong>
									</li>
									<li>
										Ne peut être tenu responsable de leur
										perte
									</li>
								</ul>
							</div>

							<div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
								<p className="font-medium text-slate-800 dark:text-slate-200">
									L'utilisateur reconnaît avoir été informé
									que la sauvegarde des données relève{" "}
									<strong>
										exclusivement de sa responsabilité
									</strong>
									.
								</p>
							</div>
						</div>
					</section>

					{/* Section 4: Sauvegardes */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
								<Download className="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
							<h2 className="text-xl font-semibold">
								4. Sauvegardes
							</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>Le logiciel propose :</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									Une fonctionnalité de{" "}
									<strong>sauvegarde manuelle</strong> (export
									des données)
								</li>
								<li>
									Des <strong>rappels de sauvegarde</strong>{" "}
									configurables (7, 14 ou 30 jours)
								</li>
							</ul>
							<p className="mt-4">
								<strong>
									Aucune sauvegarde automatique distante
								</strong>{" "}
								n'est effectuée.
							</p>
							<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
								<p className="text-amber-800 dark:text-amber-200">
									<strong>
										L'absence de sauvegarde régulière ne
										saurait être reprochée à l'éditeur.
									</strong>
								</p>
							</div>
						</div>
					</section>

					{/* Section 5: Suppression des données */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
								<Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
							</div>
							<h2 className="text-xl font-semibold">
								5. Suppression des données
							</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>La suppression des données s'effectue :</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Par action volontaire de l'utilisateur</li>
								<li>
									Avec protection par code de confirmation à 4
									chiffres
								</li>
								<li>
									De manière{" "}
									<strong>définitive et irréversible</strong>
								</li>
							</ul>
							<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
								<p className="font-medium text-red-800 dark:text-red-200">
									Toute suppression validée est définitive et
									ne pourra donner lieu à aucune récupération.
								</p>
							</div>
						</div>
					</section>

					{/* Section 6: Responsabilité médicale */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
								<Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<h2 className="text-xl font-semibold">
								6. Responsabilité médicale et légale
							</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
								<p className="font-medium text-purple-800 dark:text-purple-200 mb-2">
									Le logiciel n'est PAS un dispositif médical.
								</p>
								<p className="text-purple-700 dark:text-purple-300">
									Il ne remplace en aucun cas :
								</p>
								<ul className="list-disc list-inside space-y-1 text-purple-700 dark:text-purple-300 mt-2">
									<li>Le jugement clinique du praticien</li>
									<li>
										Les obligations légales et
										réglementaires de la profession
									</li>
									<li>
										Les outils de facturation certifiés si
										requis par la loi
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Section 7: Limitation de responsabilité */}
					<section className="bg-card rounded-lg border p-6 border-red-300 dark:border-red-700">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
								<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
							</div>
							<h2 className="text-xl font-semibold">
								7. Limitation de responsabilité
							</h2>
							<span className="px-2 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
								CLAUSE IMPORTANTE
							</span>
						</div>
						<div className="space-y-4 text-muted-foreground">
							<div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
								<p className="font-bold text-red-800 dark:text-red-200 mb-2">
									La responsabilité de l'éditeur est
									strictement limitée au montant effectivement
									payé par l'utilisateur pour l'accès au
									logiciel.
								</p>
								<p className="text-red-700 dark:text-red-300 text-sm">
									En cas de paiement de 49€, la responsabilité
									maximale de l'éditeur est limitée à 49€.
								</p>
							</div>
							<p>
								L'éditeur ne pourra en aucun cas être tenu
								responsable des dommages indirects, pertes de
								données, pertes d'exploitation, ou préjudices de
								quelque nature que ce soit.
							</p>
						</div>
					</section>

					{/* Section 8: Évolution du logiciel */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
								<RefreshCw className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
							</div>
							<h2 className="text-xl font-semibold">
								8. Évolution du logiciel
							</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>Le logiciel peut évoluer à tout moment :</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Ajout de nouvelles fonctionnalités</li>
								<li>
									Modification de fonctionnalités existantes
								</li>
								<li>Corrections de bugs</li>
							</ul>
							<p className="mt-4">
								L'éditeur n'a{" "}
								<strong>aucune obligation de maintien</strong>{" "}
								d'une version donnée du logiciel.
							</p>
						</div>
					</section>

					{/* Section 9: Droit applicable */}
					<section className="bg-card rounded-lg border p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
								<Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							</div>
							<h2 className="text-xl font-semibold">
								9. Droit applicable
							</h2>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>
								Les présentes CGU sont régies par le{" "}
								<strong>droit français</strong>.
							</p>
							<p>
								En cas de litige relatif à l'interprétation ou à
								l'exécution des présentes, les tribunaux du
								ressort du siège social de l'éditeur seront
								seuls compétents.
							</p>
						</div>
					</section>

					{/* Acceptation */}
					<section className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-700 p-6 text-center">
						<p className="text-indigo-800 dark:text-indigo-200 font-medium">
							En utilisant OstéoPraxis, vous acceptez les
							présentes Conditions Générales d'Utilisation.
						</p>
					</section>

					{/* Liens */}
					<div className="flex flex-wrap gap-4 justify-center pt-6 border-t">
						<Link
							to="/legal/mentions-legales"
							className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
						>
							Mentions Légales
						</Link>
						<span className="text-muted-foreground">•</span>
						<Link
							to="/privacy"
							className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
						>
							Politique de confidentialité
						</Link>
						<span className="text-muted-foreground">•</span>
						<Link
							to="/contact"
							className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
						>
							Contact
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CGUPage;
