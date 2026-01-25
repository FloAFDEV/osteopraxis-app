import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/ui/layout";
import { Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RegisterPostPaymentPage = () => {
	const navigate = useNavigate();
	const { register } = useAuth();
	const [loading, setLoading] = useState(false);
	const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
	});

	useEffect(() => {
		// Vérifier que le paiement a été validé
		const sessionId = localStorage.getItem("stripe_session_id");

		if (!sessionId) {
			toast.error(
				"Aucun paiement validé. Redirection vers la page de paiement.",
			);
			navigate("/pricing");
			return;
		}

		setStripeSessionId(sessionId);
	}, [navigate]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripeSessionId) {
			toast.error("Session de paiement invalide");
			return;
		}

		setLoading(true);

		try {
			// Créer le compte utilisateur
			await register({
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				password: formData.password,
			});

			// En production : associer le compte Stripe au compte utilisateur via backend
			// await associateStripeSession(stripeSessionId);

			// Nettoyer le localStorage
			localStorage.removeItem("stripe_session_id");

			toast.success("Compte créé avec succès !");

			// Rediriger vers le dashboard
			setTimeout(() => {
				navigate("/dashboard");
			}, 1500);
		} catch (error: any) {
			console.error("Erreur création compte:", error);
			toast.error(
				error.message || "Erreur lors de la création du compte",
			);
		} finally {
			setLoading(false);
		}
	};

	if (!stripeSessionId) {
		return null;
	}

	return (
		<Layout>
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
				<div className="container mx-auto px-4 max-w-md">
					{/* Success badge */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full mb-4">
							<CheckCircle className="h-5 w-5" />
							<span className="font-semibold">
								Paiement validé
							</span>
						</div>
						<h1 className="text-4xl font-bold mb-2">
							Finalisez votre compte
						</h1>
						<p className="text-lg text-muted-foreground">
							Créez vos identifiants pour accéder à votre espace
						</p>
					</div>

					{/* Form */}
					<Card>
						<CardHeader>
							<CardTitle>Informations de compte</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label htmlFor="firstName">Prénom</Label>
									<Input
										id="firstName"
										name="firstName"
										type="text"
										required
										value={formData.firstName}
										onChange={handleChange}
										placeholder="Jean"
									/>
								</div>

								<div>
									<Label htmlFor="lastName">Nom</Label>
									<Input
										id="lastName"
										name="lastName"
										type="text"
										required
										value={formData.lastName}
										onChange={handleChange}
										placeholder="Dupont"
									/>
								</div>

								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										required
										value={formData.email}
										onChange={handleChange}
										placeholder="jean.dupont@example.com"
									/>
								</div>

								<div>
									<Label htmlFor="password">
										Mot de passe
									</Label>
									<Input
										id="password"
										name="password"
										type="password"
										required
										minLength={8}
										value={formData.password}
										onChange={handleChange}
										placeholder="Minimum 8 caractères"
									/>
								</div>

								<Button
									type="submit"
									size="lg"
									className="w-full"
									disabled={loading}
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
											Création en cours...
										</>
									) : (
										"Créer mon compte"
									)}
								</Button>
							</form>

							<div className="mt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
								<Lock className="h-4 w-4" />
								<span>
									Vos données sont sécurisées et conformes HDS
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Session info */}
					<div className="mt-4 text-center text-sm text-muted-foreground">
						Session de paiement : {stripeSessionId.substring(0, 20)}
						...
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default RegisterPostPaymentPage;
