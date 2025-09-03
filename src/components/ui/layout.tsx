import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
	Activity,
	Building,
	Calendar,
	Clock,
	FileText,
	Home,
	LogOut,
	Menu,
	Settings,
	Shield,
	User,
	UserPlus,
	X,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { CurrentDateTimeDisplay } from "./CurrentDateTimeDisplay";
import { DemoIndicator } from "@/components/demo/DemoIndicator";
import { DemoService } from "@/services/demo-service";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const { user, logout, isAdmin } = useAuth();
	const isDemoMode = React.useMemo(() => user?.email ? DemoService.isDemoUser(user.email) : false, [user?.email]);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleLogout = async () => {
		await logout();
	};

	const getInitials = () => {
		if (!user) return "?";
		const firstName = user.firstName || "";
		const lastName = user.lastName || "";
		return (
			`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
			user.email.charAt(0).toUpperCase()
		);
	};

	return (
		<div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
			<header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b print:hidden">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<NavLink
							to="/"
							className="flex items-center gap-2 font-semibold text-3xl"
						>
							<Activity className="h-5 w-5 text-blue-500" />
							<h1 className="text-2xl font-extrabold tracking-tight">
								<span className="text-foreground">Patient</span>
								<span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
									Hub
								</span>
							</h1>
						</NavLink>
					</div>

					<div className="flex items-center gap-3">
						<CurrentDateTimeDisplay />
						<button
							className="md:hidden p-2 rounded-md"
							onClick={toggleMenu}
							aria-label="Toggle menu"
						>
							{isMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>

					<nav className="hidden md:flex items-center gap-6">
						<NavLink
							to="/"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-blue-500"
										: "hover:text-blue-500 text-muted-foreground"
								)
							}
						>
							<Activity className="h-4 w-4 text-blue-500" />
							Accueil
						</NavLink>
						<NavLink
							to="/patients"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-pink-500"
										: "hover:text-pink-500 text-muted-foreground"
								)
							}
						>
							<User className="h-4 w-4 text-pink-500" />
							Patients
						</NavLink>
						<NavLink
							to="/appointments"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-purple-500"
										: "hover:text-purple-500 text-muted-foreground"
								)
							}
						>
							<Calendar className="h-4 w-4 text-purple-500" />
							Séances
						</NavLink>
						<NavLink
							to="/schedule"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-amber-500"
										: "hover:text-amber-500 text-muted-foreground"
								)
							}
						>
							<Clock className="h-4 w-4 text-amber-500" />
							Planning
						</NavLink>

						<ThemeToggle />

						<DropdownMenu>
						<DropdownMenuTrigger asChild>
  <Button
    variant="ghost"
    size="sm"
    className="ml-2 p-0 group hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
  >
    <Avatar className="h-8 w-8 transition-transform duration-150 group-hover:scale-110">
      <AvatarFallback 
      className="bg-gradient-to-r from-indigo-600 to-indigo-800 font-semibold transition-colors duration-150 text-white group-hover:text-amber-300"
>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  </Button>
</DropdownMenuTrigger>

							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>
									Mon compte
								</DropdownMenuLabel>
								{user && (
									<div className="px-2 py-1.5 text-sm text-muted-foreground">
										{user.email}
									</div>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<NavLink
										to="/invoices"
										className="flex items-center cursor-pointer"
									>
										<FileText className="mr-2 h-4 w-4 text-amber-500" />
										<span>Notes d'honoraires</span>
									</NavLink>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<NavLink
										to="/settings"
										className="flex items-center cursor-pointer"
									>
										<Settings className="mr-2 h-4 w-4 text-blue-500" />
										<span>Paramètres</span>
									</NavLink>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings/cabinet"
										className="flex items-center cursor-pointer"
									>
										<Building className="mr-2 h-4 w-4 text-green-500" />
										<span>Paramètres du cabinet</span>
									</NavLink>
								</DropdownMenuItem>
								
								{/* Liens admin - uniquement pour les administrateurs */}
								{isAdmin && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<NavLink
												to="/admin"
												className="flex items-center cursor-pointer"
											>
												<Shield className="mr-2 h-4 w-4 text-red-500" />
												<span>Administration</span>
											</NavLink>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<NavLink
												to="/admin/dashboard"
												className="flex items-center cursor-pointer"
											>
												<Shield className="mr-2 h-4 w-4 text-red-500" />
												<span>Dashboard Admin</span>
											</NavLink>
										</DropdownMenuItem>
									</>
								)}
								
								<DropdownMenuItem asChild>
									{/* Placeholder for future menu item */}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
  onClick={handleLogout}
  className="text-destructive cursor-pointer hover:bg-red-600 hover:text-white focus:text-destructive"
>
  <LogOut className="mr-2 h-4 w-4" />
  <span>Déconnexion</span>
</DropdownMenuItem>

							</DropdownMenuContent>
						</DropdownMenu>
					</nav>
				</div>
			</header>

			{isMenuOpen && (
				<div className="md:hidden fixed inset-0 z-30 bg-background/95 pt-16 print:hidden">
					<nav className="container py-4 flex flex-col gap-4">
						<NavLink
							to="/"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-blue-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Home className="h-5 w-5 text-blue-500" />
							Accueil
						</NavLink>
						<NavLink
							to="/patients"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-pink-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<User className="h-5 w-5 text-pink-500" />
							Patients
						</NavLink>
						<NavLink
							to="/patients/new"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-blue-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<UserPlus className="h-5 w-5 text-blue-500" />
							Ajouter un patient
						</NavLink>
						<NavLink
							to="/appointments"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-purple-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Calendar className="h-5 w-5 text-purple-500" />
							Séances
						</NavLink>
						<NavLink
							to="/schedule"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-amber-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Clock className="h-5 w-5 text-amber-500" />
							Planning
						</NavLink>
						<NavLink
							to="/settings"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-blue-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Settings className="h-5 w-5 text-blue-500" />
							Paramètres
						</NavLink>
						<NavLink
							to="/invoices"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-amber-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<FileText className="h-5 w-5 text-amber-500" />
							Notes d'honoraires
						</NavLink>
						<NavLink
							to="/settings/cabinet"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-purple-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Building className="h-5 w-5 text-purple-500" />
							Paramètres du cabinet
						</NavLink>

						{/* Liens admin - uniquement pour les administrateurs */}
						{isAdmin && (
							<>
								<NavLink
									to="/admin"
									className={({ isActive }) =>
										cn(
											"p-2 rounded-md transition-colors flex items-center gap-2",
											isActive
												? "bg-red-500/10 text-foreground"
												: "text-foreground"
										)
									}
									onClick={() => setIsMenuOpen(false)}
								>
									<Shield className="h-5 w-5 text-red-500" />
									Administration
								</NavLink>
								<NavLink
									to="/admin/dashboard"
									className={({ isActive }) =>
										cn(
											"p-2 rounded-md transition-colors flex items-center gap-2",
											isActive
												? "bg-red-500/10 text-foreground"
												: "text-foreground"
										)
									}
									onClick={() => setIsMenuOpen(false)}
								>
									<Shield className="h-5 w-5 text-red-500" />
									Dashboard Admin
								</NavLink>
							</>
						)}

						<div className="p-2 flex items-center justify-between">
							<span className="font-light">Thème</span>
							<ThemeToggle />
						</div>

						<div
							onClick={() => {
								handleLogout();
								setIsMenuOpen(false);
							}}
							className="p-2 rounded-md transition-colors flex items-center gap-2 text-destructive mt-4 cursor-pointer font-thin"
						>
							<LogOut className="h-5 w-5" />
							Déconnexion
						</div>
					</nav>
				</div>
			)}

			<main className="flex-1 container px-4 md:px-6 py-6 print:p-0 print:m-0">
		{isDemoMode && <DemoIndicator className="mb-4" />}
		{children}
			</main>

			<footer className="border-t py-6 bg-muted/30 print:hidden">
				<div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
					<p>© 2025 PatientHub. Tous droits réservés.</p>
					<div className="flex items-center gap-4">
						<NavLink
							to="/terms-of-service"
							className="hover:text-blue-500 transition-colors"
						>
							Conditions d&apos;utilisation
						</NavLink>
						<NavLink
							to="/privacy-policy"
							className="hover:text-purple-500 transition-colors"
						>
							Politique de confidentialité
						</NavLink>
					</div>
				</div>
			</footer>

			{/* Performance Monitor - visible uniquement en développement */}
			<PerformanceMonitor />
		</div>
	);
}
