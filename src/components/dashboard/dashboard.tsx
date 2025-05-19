import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { GrowthChart as DashboardGrowthChart } from "@/components/dashboard/growth-chart";
import { GrowthChart as SimpleGrowthChart } from "@/components/growth-chart";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { Appointment, DashboardData, Patient, MonthlyGrowth } from "@/types";
import { formatAppointmentDate } from "@/utils/date-utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { isChild } from "./demographics/gender-chart-utils";

const FRENCH_MONTHS = [
	"janvier",
	"février",
	"mars",
	"avril",
	"mai",
	"juin",
	"juillet",
	"août",
	"septembre",
	"octobre",
	"novembre",
	"décembre",
];

const initialMonthlyGrowth: MonthlyGrowth[] = FRENCH_MONTHS.map((month) => ({
	month,
	patients: 0,
	prevPatients: 0,
	growthText: "0%",
	hommes: 0,
	femmes: 0,
	enfants: 0,
}));

const initialDashboardData: DashboardData = {
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
	nextAppointment: null,
	patientsLastYearEnd: 0,
	newPatientsLast30Days: 0,
	thirtyDayGrowthPercentage: 0,
	annualGrowthPercentage: 0,
	childrenCount: 0,
	monthlyGrowth: initialMonthlyGrowth,
};

// --- Fonctions Utilitaires pour les calculs ---

function calculateDemographics(patients: Patient[], currentYear: number) {
	const maleCount = patients.filter((p) => p.gender === "Homme").length;
	const femaleCount = patients.filter((p) => p.gender === "Femme").length;
	const childrenCount = patients.filter(isChild).length;

	const calculateAverageAge = (patientList: Patient[]): number => {
		const patientsWithBirthDate = patientList.filter((p) => p.birthDate);
		if (patientsWithBirthDate.length === 0) return 0;

		const totalAge = patientsWithBirthDate.reduce((sum, patient) => {
			const birthDate = new Date(patient.birthDate);
			let age = currentYear - birthDate.getFullYear();
			const monthDiff = new Date().getMonth() - birthDate.getMonth();
			if (
				monthDiff < 0 ||
				(monthDiff === 0 && new Date().getDate() < birthDate.getDate())
			) {
				age--;
			}
			return sum + Math.max(0, age); // S'assurer que l'âge n'est pas négatif
		}, 0);
		return Math.round(totalAge / patientsWithBirthDate.length);
	};

	return {
		maleCount,
		femaleCount,
		childrenCount,
		averageAge: calculateAverageAge(patients),
		averageAgeMale: calculateAverageAge(
			patients.filter((p) => p.gender === "Homme")
		),
		averageAgeFemale: calculateAverageAge(
			patients.filter((p) => p.gender === "Femme")
		),
	};
}

function calculateGrowthMetrics(
	patientsData: Patient[],
	currentYear: number,
	currentMonth: number
) {
	const newPatientsThisMonth = patientsData.filter((p) => {
		const createdAt = new Date(p.createdAt);
		return (
			createdAt.getMonth() === currentMonth &&
			createdAt.getFullYear() === currentYear
		);
	}).length;

	const newPatientsThisYear = patientsData.filter(
		(p) => new Date(p.createdAt).getFullYear() === currentYear
	).length;
	const newPatientsLastYear = patientsData.filter(
		(p) => new Date(p.createdAt).getFullYear() === currentYear - 1
	).length;

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	const newPatientsLast30Days = patientsData.filter(
		(p) => new Date(p.createdAt) >= thirtyDaysAgo
	).length;

	const patientsAtStartOf30DayPeriod = patientsData.filter(
		(p) => new Date(p.createdAt) < thirtyDaysAgo
	).length;
	const thirtyDayGrowthPercentage =
		patientsAtStartOf30DayPeriod > 0
			? Math.round(
					(newPatientsLast30Days / patientsAtStartOf30DayPeriod) * 100
			  )
			: newPatientsLast30Days > 0
			? 100
			: 0; // Si pas de patients avant, mais des nouveaux, croissance de 100%

	const patientsLastYearEnd = patientsData.filter(
		(p) => new Date(p.createdAt).getFullYear() < currentYear
	).length;
	const annualGrowthPercentage =
		patientsLastYearEnd > 0
			? Math.round((newPatientsThisYear / patientsLastYearEnd) * 100) // Croissance par rapport à la base de l'année dernière
			: newPatientsThisYear > 0
			? 100
			: 0;

	return {
		newPatientsThisMonth,
		newPatientsThisYear,
		newPatientsLastYear,
		newPatientsLast30Days,
		thirtyDayGrowthPercentage,
		annualGrowthPercentage,
		patientsLastYearEnd,
	};
}

function calculateAppointmentStats(appointments: Appointment[], today: Date) {
	const appointmentsToday = appointments.filter(
		(a) => new Date(a.date).toDateString() === today.toDateString()
	).length;

	const futureAppointments = appointments
		.filter((a) => {
			const appDate = new Date(a.date);
			return (
				appDate >= today &&
				a.status !== "CANCELED" &&
				a.status !== "COMPLETED" &&
				a.status !== "NO_SHOW"
			);
		})
		.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

	const nextAppointment =
		futureAppointments.length > 0
			? formatAppointmentDate(
					futureAppointments[0].date,
					"EEEE d MMMM yyyy 'à' HH:mm"
			  )
			: null;

	return { appointmentsToday, nextAppointment };
}

function calculateMonthlyBreakdown(
	patients: Patient[],
	currentYear: number
): MonthlyGrowth[] {
	const patientsByMonthThisYear: Patient[][] = Array(12)
		.fill(null)
		.map(() => []);
	const patientsByMonthLastYear: Patient[][] = Array(12)
		.fill(null)
		.map(() => []);

	patients.forEach((patient) => {
		const createdAt = new Date(patient.createdAt);
		const year = createdAt.getFullYear();
		const month = createdAt.getMonth();
		if (year === currentYear) {
			patientsByMonthThisYear[month].push(patient);
		} else if (year === currentYear - 1) {
			patientsByMonthLastYear[month].push(patient);
		}
	});

	return FRENCH_MONTHS.map((monthName, index) => {
		const thisMonthPatientsList = patientsByMonthThisYear[index];
		const lastYearPatientsCount = patientsByMonthLastYear[index].length;

		const hommes = thisMonthPatientsList.filter(
			(p) => p.gender === "Homme"
		).length;
		const femmes = thisMonthPatientsList.filter(
			(p) => p.gender === "Femme"
		).length;
		const enfants = thisMonthPatientsList.filter(isChild).length;

		const growthRate =
			lastYearPatientsCount > 0
				? Math.round(
						((thisMonthPatientsList.length -
							lastYearPatientsCount) /
							lastYearPatientsCount) *
							100
				  )
				: thisMonthPatientsList.length > 0
				? 100
				: 0;

		return {
			month: monthName,
			patients: thisMonthPatientsList.length,
			prevPatients: lastYearPatientsCount,
			growthText: `${growthRate}%`,
			hommes,
			femmes,
			enfants,
		};
	});
}
// --- Fin des Fonctions Utilitaires ---

export function Dashboard() {
	const [dashboardData, setDashboardData] =
		useState<DashboardData>(initialDashboardData);
	const [loading, setLoading] = useState(true);
	const [allPatients, setAllPatients] = useState<Patient[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [chartType, setChartType] = useState<"detailed" | "simple">(
		"detailed"
	);

	useEffect(() => {
		const loadDashboardData = async () => {
			setLoading(true);
			setError(null);
			try {
				// Récupération des données réelles
				const [patientsData, appointmentsData] = await Promise.all([
					api.getPatients(),
					api.getAppointments(),
				]);

				setAllPatients(patientsData); // Stocker tous les patients pour DemographicsCard

				const today = new Date();
				const currentYear = today.getFullYear();
				const currentMonth = today.getMonth();

				const demographics = calculateDemographics(
					patientsData,
					currentYear
				);
				const growthMetrics = calculateGrowthMetrics(
					patientsData,
					currentYear,
					currentMonth
				);
				const appointmentStats = calculateAppointmentStats(
					appointmentsData,
					today
				);
				const monthlyGrowthData = calculateMonthlyBreakdown(
					patientsData,
					currentYear
				);

				setDashboardData({
					totalPatients: patientsData.length,
					...demographics,
					...growthMetrics,
					...appointmentStats,
					monthlyGrowth: monthlyGrowthData,
				});
			} catch (err) {
				console.error(
					"Erreur lors du chargement des données du tableau de bord:",
					err
				);
				setError(
					"Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard."
				);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, []); // Dépendance vide car on charge une seule fois

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				{" "}
				{/* Adjusted for full screen loading */}
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-blue-500" />
					<p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
						Chargement des données...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<Card className="w-full max-w-md text-center">
					<CardContent className="p-6">
						<h2 className="text-xl font-semibold text-destructive mb-2">
							Erreur
						</h2>
						<p className="text-muted-foreground">{error}</p>
						<button
							onClick={() => window.location.reload()} // Simple way to retry
							className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
						>
							Réessayer
						</button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-4 sm:p-6 lg:p-8">
			{" "}
			{/* Added padding to the main container */}
			{/* Header Image Banner */}
			<div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg animate-fade-in transition-all duration-500 hover:scale-[1.01]">
				<img
					src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600&h=400" // Consider optimizing image for web
					alt="Cabinet d'ostéopathie"
					className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
					loading="lazy" // Lazy load image
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
			{/* Main content is already rendered if not loading and no error */}
			<>
				<div className="animate-fade-in">
					<DashboardStats data={dashboardData} />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{" "}
					{/* Removed extra padding from here */}
					<div className="animate-fade-in animate-delay-100">
						<AppointmentsOverview data={dashboardData} />
					</div>
					<div className="animate-fade-in animate-delay-200">
						<DemographicsCard
							patients={allPatients} // Pass allPatients
							data={dashboardData} // data.childrenCount, data.maleCount, data.femaleCount, etc. can be derived from allPatients too
						/>
					</div>
				</div>

				<div className="animate-fade-in animate-delay-300">
					{" "}
					{/* Removed extra padding */}
					<Card className="hover-scale">
						<CardContent className="p-6 bg-inherit">
							{" "}
							{/* Ensure bg-inherit has desired effect or remove */}
							<h2 className="text-2xl font-bold mb-4">
								Évolution de l'activité
							</h2>
							<div className="h-full">
								{" "}
								{/* Ensure GrowthChart handles its own height or provide specific height */}
								{chartType === "detailed" ? (
									<DashboardGrowthChart
										data={dashboardData}
									/>
								) : (
									<SimpleGrowthChart data={dashboardData} />
								)}{" "}
							</div>
							<div className="m-0 mt-4 flex items-center gap-2">
								<label
									htmlFor="chartType"
									className="text-sm font-medium"
								>
									Type de graphique :
								</label>

								<button
									id="chartType"
									type="button"
									aria-label={`Changer le type de graphique (actuellement : ${
										chartType === "detailed"
											? "Évolution annuelle"
											: "Comparaison avec N-1"
									})`}
									onClick={() =>
										setChartType(
											chartType === "detailed"
												? "simple"
												: "detailed"
										)
									}
									className="relative w-44 h-9 text-xs rounded border border-gray-300 bg-gray-100 dark:text-gray-300 dark:bg-slate-700 perspective-[1000px] focus:outline-none"
								>
									<div
										className={`relative w-full h-full transition-transform duration-700 ease-[cubic\\-bezier\\(0.4\\,0.0\\,0.2\\,1\\)] [transform-style:preserve-3d] will-change-transform ${
											chartType === "simple"
												? "[transform:rotateY(180deg)]"
												: ""
										}`}
									>
										<div className="absolute inset-0 flex items-center justify-center px-2 font-bold text-center text-teal-700 dark:text-sky-400 [backface-visibility:hidden]">
											Évolution annuelle
										</div>
										<div className="absolute inset-0 flex items-center justify-center px-2 font-bold text-center text-teal-700 dark:text-sky-400 [backface-visibility:hidden] [transform:rotateY(180deg)]">
											Comparaison avec N-1
										</div>
									</div>
								</button>
							</div>
						</CardContent>
					</Card>
				</div>
			</>
		</div>
	);
}
