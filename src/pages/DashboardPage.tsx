import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { DemoIndicator } from "@/components/demo/DemoIndicator";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
	const { isDemoMode } = useAuth();

	return (
		<Layout>
			{/* Indicateur démo discret en haut */}
			{isDemoMode && (
				<div className="px-4 pt-2">
					<DemoIndicator showCTA={false} />
				</div>
			)}

			{/* Dashboard compact */}
			<Dashboard />
		</Layout>
	);
};

export default DashboardPage;
