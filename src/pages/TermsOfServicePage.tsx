import React from "react";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfServicePage = () => {
	return (
		<Layout>
			<div className="container mx-auto py-8 max-w-4xl">
				<Card>
					<CardHeader>
						<CardTitle className="text-3xl font-bold">
							Conditions Générales d’Utilisation – AFDEV
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[60vh]">
							<div className="space-y-6">
								<section>
									<h2 className="text-2xl font-semibold mb-4">
										1. Introduction
									</h2>
									<p>
										Les présentes Conditions Générales
										d’Utilisation (CGU) régissent l’accès et
										l’utilisation de la plateforme
										développée par AFDEV. En accédant à nos
										services, vous acceptez sans réserve ces
										conditions. Veuillez les lire
										attentivement avant toute utilisation.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										2. Description du Service
									</h2>
									<p>
										La plateforme AFDEV propose aux
										ostéopathes une solution intuitive pour
										gérer leurs consultations, leurs
										dossiers patients, leurs rendez-vous et
										leur facturation, en conformité avec les
										normes en vigueur en matière de
										confidentialité et de sécurité des
										données de santé.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										3. Conditions d’Accès
									</h2>
									<p>
										L’utilisation du service est réservée
										aux professionnels de santé dûment
										autorisés à exercer. L’utilisateur doit
										disposer d’un compte actif, sécurisé par
										des identifiants personnels dont il est
										seul responsable.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										4. Données Personnelles et
										Confidentialité
									</h2>
									<p>
										AFDEV s’engage à assurer la protection
										des données personnelles et médicales
										conformément au Règlement Général sur la
										Protection des Données (RGPD) et à toute
										réglementation applicable. Pour plus de
										détails, veuillez consulter notre
										Politique de Confidentialité.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										5. Propriété Intellectuelle
									</h2>
									<p>
										L’ensemble des éléments constituant la
										plateforme (contenus, interfaces,
										développements, marques, logos, etc.)
										est la propriété exclusive d’AFDEV.
										Toute reproduction, représentation ou
										utilisation sans autorisation est
										strictement interdite.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										6. Responsabilités de l’Utilisateur
									</h2>
									<p>
										L’utilisateur est seul responsable des
										données qu’il saisit ou importe dans la
										plateforme. AFDEV ne saurait être tenu
										responsable d’erreurs, d’omissions ou de
										conséquences liées à une utilisation
										inappropriée du service.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										7. Évolutions du Service
									</h2>
									<p>
										AFDEV se réserve le droit de faire
										évoluer, modifier ou suspendre certaines
										fonctionnalités du service, à tout
										moment, dans un souci d’amélioration
										continue. Les utilisateurs seront
										informés des changements majeurs dans la
										mesure du possible.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										8. Résiliation
									</h2>
									<p>
										En cas de non-respect des présentes CGU,
										AFDEV se réserve le droit de suspendre
										ou de résilier l’accès à la plateforme,
										sans préavis, et sans préjudice des
										recours éventuels.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										9. Loi Applicable
									</h2>
									<p>
										Les présentes conditions sont régies par
										le droit français. En cas de litige, une
										solution amiable sera privilégiée avant
										tout recours judiciaire.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										10. Contact
									</h2>
									<p>
										Pour toute question ou réclamation
										relative à ces CGU, vous pouvez nous
										contacter à l’adresse suivante :{" "}
										<a
											href="mailto:support@afdev.fr"
											className="underline"
										>
											support@afdev.fr
										</a>
										.
									</p>
								</section>

								<p className="text-sm text-gray-500 pt-6">
									Dernière mise à jour : 8 avril 2025
								</p>
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default TermsOfServicePage;
