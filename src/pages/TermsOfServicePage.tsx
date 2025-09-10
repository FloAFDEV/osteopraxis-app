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
							Conditions Générales d'Utilisation – AFDEV
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
										d'Utilisation (CGU) régissent l'accès et
										l'utilisation de la plateforme
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
										3. Conditions d'Accès
									</h2>
									<p>
										L'utilisation du service est réservée
										aux professionnels de santé dûment
										autorisés à exercer en France. L'utilisateur doit
										disposer d'un compte actif, sécurisé par
										des identifiants personnels dont il est
										seul responsable. L'inscription nécessite
										la validation de votre numéro ADELI ou RPPS.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										4. Données Personnelles et
										Confidentialité
									</h2>
									<p>
										AFDEV s'engage à assurer la protection
										des données personnelles et médicales
										conformément au Règlement Général sur la
										Protection des Données (RGPD), à la loi
										Informatique et Libertés, au Code de la santé 
										publique français et aux exigences HDS 
										(Hébergement de Données de Santé). Pour plus de
										détails, veuillez consulter notre
										Politique de Confidentialité.
									</p>
									<p className="mt-2">
										Les données de santé sont protégées par un 
										stockage local chiffré AES-256, garantissant 
										leur sécurité conformément à l'article L.1111-8 
										du Code de la santé publique.
									</p>
									<p className="mt-2 text-sm">
										Numéro de déclaration CNIL : [À compléter lors de la mise en production]
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										5. Propriété Intellectuelle
									</h2>
									<p>
										L'ensemble des éléments constituant la
										plateforme (contenus, interfaces,
										développements, marques, logos, etc.)
										est la propriété exclusive d'AFDEV.
										Toute reproduction, représentation ou
										utilisation sans autorisation écrite préalable est
										strictement interdite et constitue une
										contrefaçon passible de sanctions pénales.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										6. Responsabilités de l'Utilisateur
									</h2>
									<p>
										L'utilisateur est seul responsable des
										données qu'il saisit ou importe dans la
										plateforme. Il s'engage à respecter le 
										secret professionnel médical et les obligations
										déontologiques de sa profession. AFDEV ne saurait être tenu
										responsable d'erreurs, d'omissions ou de
										conséquences liées à une utilisation
										inappropriée du service.
									</p>
									<p className="mt-2">
										L'utilisateur s'engage à ne pas utiliser le service
										à des fins illégales ou contraires à l'éthique médicale.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										7. Disponibilité et Évolutions du Service
									</h2>
									<p>
										AFDEV s'efforce d'assurer la disponibilité 
										du service 24h/24 et 7j/7, mais ne peut 
										garantir une disponibilité absolue. Des 
										interruptions pour maintenance seront notifiées
										à l'avance dans la mesure du possible.
									</p>
									<p className="mt-2">
										AFDEV se réserve le droit de faire
										évoluer, modifier ou suspendre certaines
										fonctionnalités du service, à tout
										moment, dans un souci d'amélioration
										continue. Les utilisateurs seront
										informés des changements majeurs avec un 
										préavis de 30 jours minimum.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										8. Tarification et Facturation
									</h2>
									<p>
										Les conditions tarifaires en vigueur sont 
										disponibles sur notre site web. Tout changement
										de tarif sera notifié avec un préavis de 
										60 jours. Les factures sont payables sous 
										30 jours à réception.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										9. Résiliation
									</h2>
									<p>
										En cas de non-respect des présentes CGU,
										AFDEV se réserve le droit de suspendre
										ou de résilier l'accès à la plateforme,
										après mise en demeure restée sans effet
										sous 15 jours, et sans préjudice des
										recours éventuels. L'utilisateur peut 
										résilier son abonnement à tout moment 
										avec un préavis de 30 jours.
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										10. Loi Applicable et Règlement des Litiges
									</h2>
									<p>
										Les présentes conditions sont régies par
										le droit français. En cas de litige, une
										solution amiable sera privilégiée avant
										tout recours judiciaire. À défaut d'accord 
										amiable dans un délai de 60 jours, le litige 
										sera soumis à la juridiction compétente.
									</p>
									<p className="mt-2">
										À défaut d'accord amiable, tout litige sera
										soumis aux tribunaux français compétents
										conformément aux règles de droit commun.
										En cas de litige avec un consommateur, 
										possibilité de recours à la médiation.
									</p>
									<p className="mt-2 text-sm">
										AFDEV - Société par actions simplifiée<br />
										SIRET : [À compléter lors de la mise en production]<br />
										Code APE : [À compléter lors de la mise en production]<br />
										TVA intracommunautaire : [À compléter lors de la mise en production]
									</p>
								</section>

								<section>
									<h2 className="text-2xl font-semibold mb-4">
										11. Contact
									</h2>
									<p>
										Pour toute question ou réclamation
										relative à ces CGU, vous pouvez nous
										contacter :
									</p>
									<ul className="list-disc pl-6 mt-2 space-y-2">
										<li>Par e-mail : <a href="mailto:support@afdev.fr" className="underline">support@afdev.fr</a></li>
										<li>Par courrier : AFDEV, [Adresse à compléter], France</li>
										<li>Par téléphone : [Numéro à compléter] (du lundi au vendredi, 9h-18h)</li>
									</ul>
								</section>

								<p className="text-sm text-gray-500 pt-6">
									Dernière mise à jour : 10 septembre 2025<br />
									Version 2.0 - Conforme au droit français et aux réglementations de santé
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