
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment, AppointmentStatus, Invoice, Patient } from "@/types";
import { Activity, Calendar, History } from "lucide-react";
import { useRef } from "react";
import { MedicalInfoTab } from "./MedicalInfoTab";
import { UpcomingAppointmentsTab } from "./UpcomingAppointmentsTab";
import { AppointmentHistoryTab } from "./AppointmentHistoryTab";
import { InvoicesTab } from "./InvoicesTab";

interface PatientDetailTabsProps {
	patient: Patient;
	upcomingAppointments: Appointment[];
	pastAppointments: Appointment[];
	invoices: Invoice[];
	onCancelAppointment: (appointmentId: number) => Promise<void>;
	onUpdateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
	viewMode: "cards" | "table";
	setViewMode: (mode: "cards" | "table") => void;
}

export function PatientDetailTabs({
	patient,
	upcomingAppointments,
	pastAppointments,
	invoices,
	onCancelAppointment,
	onUpdateAppointmentStatus,
	viewMode,
	setViewMode
}: PatientDetailTabsProps) {
	const historyTabRef = useRef<HTMLButtonElement>(null);
	
	const navigateToHistoryTab = () => {
		if (historyTabRef.current) {
			historyTabRef.current.click();
		}
	};
	
	return (
		<Tabs defaultValue="medical-info">
			<TabsList className="grid w-full grid-cols-4">
				<TabsTrigger value="medical-info">
					<Activity className="h-4 w-4 mr-2" />
					Dossier médical
				</TabsTrigger>
				<TabsTrigger value="upcoming-appointments">
					<Calendar className="h-4 w-4 mr-2" />
					Séances à venir
				</TabsTrigger>
				<TabsTrigger value="history" ref={historyTabRef}>
					<History className="h-4 w-4 mr-2" />
					Historique
				</TabsTrigger>
				<TabsTrigger value="invoices">
					<Activity className="h-4 w-4 mr-2" />
					Notes d'honoraires
				</TabsTrigger>
			</TabsList>

			<TabsContent value="medical-info">
				<MedicalInfoTab 
					patient={patient}
					pastAppointments={pastAppointments}
					onUpdateAppointmentStatus={onUpdateAppointmentStatus}
					onNavigateToHistory={navigateToHistoryTab}
				/>
			</TabsContent>

			<TabsContent value="upcoming-appointments">
				<UpcomingAppointmentsTab
					patient={patient}
					appointments={upcomingAppointments}
					onCancelAppointment={onCancelAppointment}
					onStatusChange={onUpdateAppointmentStatus}
				/>
			</TabsContent>

			<TabsContent value="history">
				<AppointmentHistoryTab
					appointments={pastAppointments}
					onStatusChange={onUpdateAppointmentStatus}
					viewMode={viewMode}
					setViewMode={setViewMode}
				/>
			</TabsContent>

			<TabsContent value="invoices">
				<InvoicesTab 
					patient={patient} 
					invoices={invoices} 
				/>
			</TabsContent>
		</Tabs>
	);
}
