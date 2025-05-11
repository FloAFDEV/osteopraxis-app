
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { DashboardData, Patient } from "@/types";
import { formatAppointmentDate } from "@/utils/date-utils";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isChild } from "./demographics/gender-chart-utils";

export function Dashboard() {
	const [dashboardData, setDashboardData] = useState<DashboardData>({
		totalPatients: 0,
		maleCount: 0,
		femaleCount: 0,
		averageAge: 0,
		averageAgeMale: 0,
		averageAgeFemale: 0,
		newPatientsThisMonth: 0,
		newPatientsThisYear: 0,
		newPatientsLastYear: 0,
		appointmentsToday: 0,
		nextAppointment: "Aucune séance prévue",
		patientsLastYearEnd: 0,
		newPatientsLast30Days: 0,
		thirtyDayGrowthPercentage: 0,
		annualGrowthPercentage: 0,
		childrenCount: 0, // Initialize childrenCount
		monthlyGrowth: Array(12)
			.fill(0)
			.map((_, index) => {
				const frenchMonths = [
					"Jan",
					"Fév",
					"Mar",
					"Avr",
					"Mai",
					"Juin",
					"Juil",
					"Août",
					"Sep",
					"Oct",
					"Nov",
					"Déc",
				];
				return {
					month: frenchMonths[index],
					patients: 0,
					prevPatients: 0,
					growthText: "0%",
					hommes: 0,    // Add default values for hommes
					femmes: 0,    // Add default values for femmes
					enfants: 0,   // Add default values for enfants
				};
			}),
	});

	const [loading, setLoading] = useState(true);
	const [patients, setPatients] = useState<any[]>([]); // Ajout d'un state pour les patients

	useEffect(() => {
		const loadDashboardData = async () => {
			setLoading(true);
			try {
				// Récupération des données réelles uniquement
				const [patientsData, appointments] = await Promise.all([
					api.getPatients(),
					api.getAppointments(),
				]);

				// Stocker les patients pour les utiliser dans les sous-composants
				setPatients(patientsData);

				// Calcul des statistiques avec uniquement les données réelles
				const totalPatients = patientsData.length;
				const maleCount = patientsData.filter(
					(p) => p.gender === "Homme"
				).length;
				const femaleCount = patientsData.filter(
					(p) => p.gender === "Femme"
				).length;

				// Calculate the children count
				const childrenCount = patientsData.filter(isChild).length;
				console.log(
					`Dashboard data loading - Found ${childrenCount} children among ${totalPatients} patients`
				);

				// Calcul des âges et métriques de croissance
				const today = new Date();
				const currentYear = today.getFullYear();
				const currentMonth = today.getMonth();

				// Nouveaux patients ce mois-ci et cette année
				const newPatientsThisMonth = patientsData.filter((p) => {
					const createdAt = new Date(p.createdAt);
					return (
						createdAt.getMonth() === currentMonth &&
						createdAt.getFullYear() === currentYear
					);
				}).length;

				const newPatientsThisYear = patients.filter((p) => {
					const createdAt = new Date(p.createdAt);
					return createdAt.getFullYear() === currentYear;
				}).length;

				const newPatientsLastYear = patients.filter((p) => {
					const createdAt = new Date(p.createdAt);
					return createdAt.getFullYear() === currentYear - 1;
				}).length;

				// Rendez-vous aujourd'hui
				const appointmentsToday = appointments.filter((a) => {
					const appDate = new Date(a.date);
					return appDate.toDateString() === today.toDateString();
				}).length;

				// Prochain rendez-vous - vérifier les rendez-vous à venir et prendre le plus proche
				const futureAppointments = appointments
					.filter((a) => {
						// Filtrer les rendez-vous à venir et non annulés
						const appDate = new Date(a.date);
						return (
							appDate > today &&
							a.status !== "CANCELED" &&
							a.status !== "NO_SHOW"
						);
					})
					.sort(
						(a, b) =>
							new Date(a.date).getTime() -
							new Date(b.date).getTime()
					);

				// Obtenir les informations détaillées du prochain rendez-vous
				let nextAppointment = "Aucune séance prévue";
				if (futureAppointments.length > 0) {
					const nextApp = futureAppointments[0];
					// Formater la date complète pour afficher le jour, la date et l'heure
					nextAppointment = formatAppointmentDate(
						nextApp.date,
						"EEEE d MMMM yyyy 'à' HH:mm"
					);
				}

				// Calcul de la croissance sur 30 jours
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

				const newPatientsLast30Days = patients.filter((p) => {
					const createdAt = new Date(p.createdAt);
					return createdAt >= thirtyDaysAgo;
				}).length;

				const sixtyDaysAgo = new Date();
				sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

				const patientsPrevious30Days = patients.filter((p) => {
					const createdAt = new Date(p.createdAt);
					return (
						createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo
					);
				}).length;

				// Taux de croissance
				const thirtyDayGrowthPercentage =
					patientsPrevious30Days > 0
						? Math.round(
								((newPatientsLast30Days -
									patientsPrevious30Days) /
									patientsPrevious30Days) *
									100
						  )
						: newPatientsLast30Days > 0
						? 100
						: 0;

				const patientsLastYearEnd = patientsData.filter((p) => {
					const createdAt = new Date(p.createdAt);
					return createdAt.getFullYear() < currentYear;
				}).length;

				const annualGrowthPercentage =
					patientsLastYearEnd > 0
						? Math.round(
								(newPatientsThisYear / patientsLastYearEnd) *
									100
						  )
						: newPatientsThisYear > 0
						? 100
						: 0;

				// Données de croissance mensuelle avec distribution par genre et âge
				const frenchMonths = [
					"Jan",
					"Fév",
					"Mar",
					"Avr",
					"Mai",
					"Juin",
					"Juil",
					"Août",
					"Sep",
					"Oct",
					"Nov",
					"Déc",
				];
				
				// Création d'un tableau pour stocker les patients par mois (cette année)
				const patientsByMonth = Array(12).fill(0).map(() => []);
				
				// Grouper les patients par mois de création
				patientsData.forEach(patient => {
					const createdAt = new Date(patient.createdAt);
					// Ne considérer que les patients créés cette année
					if (createdAt.getFullYear() === currentYear) {
						const month = createdAt.getMonth();
						patientsByMonth[month].push(patient);
					}
				});
				
				const monthlyGrowth = frenchMonths.map((month, index) => {
					// Patients créés ce mois-ci cette année
					const thisMonthPatients = patientsByMonth[index].length;
					
					// Patients de l'année dernière (pour comparaison)
					const lastYearPatients = patientsData.filter((p) => {
						const createdAt = new Date(p.createdAt);
						return (
							createdAt.getMonth() === index &&
							createdAt.getFullYear() === currentYear - 1
						);
					}).length;

					// Calcul du taux de croissance
					const growthRate =
						lastYearPatients > 0
							? Math.round(
									((thisMonthPatients - lastYearPatients) /
										lastYearPatients) *
										100
							  )
							: thisMonthPatients > 0
							? 100
							: 0;

					// Calculate gender and age distribution for this month
					const thisMonthMaleCount = patientsByMonth[index].filter(p => p.gender === "Homme").length;
					const thisMonthFemaleCount = patientsByMonth[index].filter(p => p.gender === "Femme").length;
					const thisMonthChildrenCount = patientsByMonth[index].filter(isChild).length;

					return {
						month,
						patients: thisMonthPatients,
						prevPatients: lastYearPatients,
						growthText: `${growthRate}%`,
						hommes: thisMonthMaleCount,    // Add male count
						femmes: thisMonthFemaleCount,  // Add female count
						enfants: thisMonthChildrenCount  // Add children count
					};
				});

				console.log("Données mensuelles générées:", monthlyGrowth);

				// Calcul des âges moyens
				const calculateAverageAge = (patientList: any[]) => {
					const patientsWithBirthDate = patientList.filter(
						(p) => p.birthDate
					);
					if (patientsWithBirthDate.length === 0) return 0;

					const totalAge = patientsWithBirthDate.reduce(
						(sum, patient) => {
							const birthDate = new Date(patient.birthDate);
							const age = currentYear - birthDate.getFullYear();
							return sum + age;
						},
						0
					);

					return Math.round(totalAge / patientsWithBirthDate.length);
				};

				const averageAge = calculateAverageAge(patientsData);
				const averageAgeMale = calculateAverageAge(
					patientsData.filter((p) => p.gender === "Homme")
				);
				const averageAgeFemale = calculateAverageAge(
					patientsData.filter((p) => p.gender === "Femme")
				);

				// Mettre à jour les données du tableau de bord
				setDashboardData({
					totalPatients,
					maleCount,
					femaleCount,
					averageAge,
					averageAgeMale,
					averageAgeFemale,
					newPatientsThisMonth,
					newPatientsThisYear,
					newPatientsLastYear,
					appointmentsToday,
					nextAppointment,
					patientsLastYearEnd,
					newPatientsLast30Days,
					thirtyDayGrowthPercentage,
					annualGrowthPercentage,
					childrenCount,
					monthlyGrowth,
				});
			} catch (error) {
				console.error(
					"Erreur lors du chargement des données du tableau de bord:",
					error
				);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, []);

	return (
		<div className="space-y-8">
			{/* Header Image Banner */}
			<div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg mb-8 animate-fade-in shadow-lg transform hover:scale-[1.01] transition-all duration-500">
				<img
					src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600&h=400"
					alt="Cabinet d'ostéopathie"
					className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
					<div className="px-6 md:px-10 max-w-2xl animate-fade-in animate-delay-100">
						<h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
							Tableau de bord
						</h1>
						<p className="text-white/90 text-sm md:text-base lg:text-lg max-w-md">
							Bienvenue sur votre espace de gestion. Suivez vos
							activités et consultez vos statistiques en temps
							réel.
						</p>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-12 w-12 animate-spin text-blue-500" />
						<p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
							Chargement des données...
						</p>
					</div>
				</div>
			) : (
				<>
					<div className="animate-fade-in">
						<DashboardStats data={dashboardData} />
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 sm:px-0">
						<div className="animate-fade-in animate-delay-100">
							<AppointmentsOverview data={dashboardData} />
						</div>
						<div className="animate-fade-in animate-delay-200">
							<DemographicsCard
								patients={patients}
								data={dashboardData}
							/>
						</div>
					</div>

					<div className="animate-fade-in animate-delay-300 px-2 sm:px-0">
						<Card className="hover-scale">
							<CardContent className="p-6 bg-inherit">
								<h2 className="text-xl font-bold mb-4">
									Évolution de l'activité
								</h2>
								<div className="h-full">
									<GrowthChart data={dashboardData} />
								</div>
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</div>
	);
}
