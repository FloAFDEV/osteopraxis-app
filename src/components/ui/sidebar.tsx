import { CabinetSelector } from "@/components/cabinet/cabinet-selector";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile"; // Correction ici: useMobile -> useIsMobile
import { cn } from "@/lib/utils";
import {
	Building,
	Calendar,
	CreditCard,
	Home,
	LogOut,
	Menu,
	Settings,
	ShieldCheck,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const { logout, user } = useAuth();
	const { isMobile } = useIsMobile();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCabinetId, setSelectedCabinetId] = useState<
		number | undefined
	>(undefined);
	const location = useLocation();
	const navigate = useNavigate();

	// Fermer le menu mobile lorsque la route change
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	// Récupérer le cabinet préféré depuis le localStorage
	useEffect(() => {
		const storedCabinetId = localStorage.getItem("selectedCabinetId");
		if (storedCabinetId) {
			setSelectedCabinetId(Number(storedCabinetId));
		}
	}, []);

	const handleCabinetChange = (cabinetId: number) => {
		setSelectedCabinetId(cabinetId);
		localStorage.setItem("selectedCabinetId", cabinetId.toString());
		// Vous pouvez ajouter une logique pour recharger les données en fonction du cabinet sélectionné
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const isAdmin = user?.role === "ADMIN";

	const sidebarContent = (
		<>
			<div className="px-3 py-2">
				<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-5">
					PatientHub
				</h1>
				<div className="mb-6">
					<CabinetSelector
						selectedCabinetId={selectedCabinetId}
						onCabinetChange={handleCabinetChange}
						className="w-full"
					/>
				</div>
				<nav className="space-y-1">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground"
							)
						}
					>
						<Home className="h-4 w-4" />
						<span>Tableau de bord</span>
					</NavLink>
					<NavLink
						to="/patients"
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground"
							)
						}
					>
						<Users className="h-4 w-4" />
						<span>Patients</span>
					</NavLink>
					<NavLink
						to="/appointments"
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground"
							)
						}
					>
						<Calendar className="h-4 w-4" />
						<span>Séances</span>
					</NavLink>
					<NavLink
						to="/invoices"
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground"
							)
						}
					>
						<CreditCard className="h-4 w-4" />
						<span>Notes d'honoraires</span>
					</NavLink>
					<NavLink
						to="/cabinets"
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground"
							)
						}
					>
						<Building className="h-4 w-4" />
						<span>Cabinets</span>
					</NavLink>

					{/* Lien Administration visible uniquement pour les admins */}
					{isAdmin && (
						<NavLink
							to="/admin"
							className={({ isActive }) =>
								cn(
									"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors mt-4 border-t pt-4",
									isActive
										? "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
										: "hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-900/20 dark:hover:text-amber-300"
								)
							}
						>
							<ShieldCheck className="h-4 w-4" />
							<span>Administration</span>
						</NavLink>
					)}
				</nav>
			</div>
			<div className="px-3 py-2 mt-auto">
				<div className="space-y-1">
					<NavLink
						to="/settings"
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground"
							)
						}
					>
						<Settings className="h-4 w-4" />
						<span>Paramètres</span>
					</NavLink>
					<button
						onClick={handleLogout}
						className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						<LogOut className="h-4 w-4 text-red-500" />
						<span className="text-red-500">Déconnexion</span>
					</button>
				</div>
			</div>
		</>
	);

	return (
		<>
			{/* Version mobile */}
			{isMobile && (
				<div className="lg:hidden">
					<button
						onClick={() => setIsOpen(true)}
						className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-md border bg-background"
						aria-label="Ouvrir le menu"
					>
						<Menu className="h-4 w-4" />
					</button>
					{isOpen && (
						<>
							{/* Overlay */}
							<div
								className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
								onClick={() => setIsOpen(false)}
							/>
							{/* Menu Slideover */}
							<div className="fixed inset-y-0 left-0 z-50 w-80 animate-in slide-in-from-left bg-background border-r p-6">
								<button
									onClick={() => setIsOpen(false)}
									className="absolute top-4 right-4"
								>
									<X className="h-4 w-4" />
								</button>
								<div className="flex flex-col h-full overflow-y-auto">
									{sidebarContent}
								</div>
							</div>
						</>
					)}
				</div>
			)}
			{/* Version desktop */}
			<div
				className={cn(
					"hidden lg:flex lg:flex-col lg:border-r h-screen overflow-y-auto sticky top-0 w-64",
					className
				)}
			>
				<div className="flex flex-col h-full py-6">
					{sidebarContent}
				</div>
			</div>
		</>
	);
}
