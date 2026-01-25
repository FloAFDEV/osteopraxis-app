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
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
	Activity,
	BarChart3,
	Building,
	Calendar,
	Clock,
	FileText,
	HelpCircle,
	Home,
	LogOut,
	Menu,
	User,
	X,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const { user, signOut, isDemoMode, demoCabinetName, remainingDemoTime } =
		useAuth();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleLogout = async () => {
		await signOut();
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

	const formatRemainingTime = (ms: number): string => {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);

		if (hours > 0) {
			return `${hours}h ${minutes}min ${seconds}s`;
		}
		return `${minutes}min ${seconds}s`;
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{isDemoMode && (
				<div className="bg-slate-500 text-slate-100 px-3 py-1 text-center text-sm leading-none">
					Démo • {demoCabinetName} •{" "}
					{formatRemainingTime(remainingDemoTime)}
				</div>
			)}

			<header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b print:hidden">
				<div className="max-w-[1600px] mx-auto px-4 flex h-11 items-center justify-between">
					<div className="flex items-center gap-2">
						<NavLink
							to="/"
							className="flex items-center gap-1.5 font-semibold"
						>
							<Activity className="h-4 w-4 text-slate-500" />
							<span className="text-sm font-bold tracking-tight text-foreground">
								OstéoPraxis
							</span>
						</NavLink>
					</div>

					<div className="flex items-center gap-2 md:hidden">
						<button
							className="p-1.5 rounded-md"
							onClick={toggleMenu}
							aria-label="Toggle menu"
						>
							{isMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</button>
					</div>

					<nav className="hidden md:flex items-center gap-4">
						<NavLink
							to="/"
							className={({ isActive }) =>
								cn(
									"text-sm transition-colors flex items-center gap-1",
									isActive
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)
							}
						>
							<Activity className="h-3.5 w-3.5" />
							Accueil
						</NavLink>
						<NavLink
							to="/patients"
							className={({ isActive }) =>
								cn(
									"text-sm transition-colors flex items-center gap-1",
									isActive
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)
							}
						>
							<User className="h-3.5 w-3.5" />
							Patients
						</NavLink>
						<NavLink
							to="/appointments"
							className={({ isActive }) =>
								cn(
									"text-sm transition-colors flex items-center gap-1",
									isActive
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)
							}
						>
							<Calendar className="h-3.5 w-3.5" />
							Séances
						</NavLink>
						<NavLink
							to="/schedule"
							className={({ isActive }) =>
								cn(
									"text-sm transition-colors flex items-center gap-1",
									isActive
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)
							}
						>
							<Clock className="h-3.5 w-3.5" />
							Planning
						</NavLink>
						<NavLink
							to="/invoices"
							className={({ isActive }) =>
								cn(
									"text-sm transition-colors flex items-center gap-1",
									isActive
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)
							}
						>
							<FileText className="h-3.5 w-3.5" />
							Factures
						</NavLink>
						<NavLink
							to="/statistics"
							className={({ isActive }) =>
								cn(
									"text-sm transition-colors flex items-center gap-1",
									isActive
										? "text-foreground font-medium"
										: "text-muted-foreground hover:text-foreground",
								)
							}
						>
							<BarChart3 className="h-3.5 w-3.5" />
							Stats
						</NavLink>

						<ThemeToggle />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="ml-1 p-0 hover:bg-transparent"
								>
									<Avatar className="h-6 w-6">
										<AvatarFallback className="bg-slate-600 text-white text-sm font-medium">
											{getInitials()}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuLabel className="text-sm">
									Mon compte
								</DropdownMenuLabel>
								{user && (
									<div className="px-2 py-1 text-sm text-muted-foreground">
										{user.email}
									</div>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings/profile"
										className="flex items-center cursor-pointer text-sm"
									>
										<User className="mr-2 h-3.5 w-3.5 text-slate-500" />
										<span>Mon Profil</span>
									</NavLink>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings"
										className="flex items-center cursor-pointer text-sm"
									>
										<HelpCircle className="mr-2 h-3.5 w-3.5 text-slate-500" />
										<span>Guide</span>
									</NavLink>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings/cabinet"
										className="flex items-center cursor-pointer text-sm"
									>
										<Building className="mr-2 h-3.5 w-3.5 text-slate-500" />
										<span>Paramètres cabinet</span>
									</NavLink>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings/osteopath"
										className="flex items-center cursor-pointer text-sm"
									>
										<User className="mr-2 h-3.5 w-3.5 text-slate-500" />
										<span>Profil & Facturation</span>
									</NavLink>
								</DropdownMenuItem>

								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-destructive cursor-pointer text-sm"
								>
									<LogOut className="mr-2 h-3.5 w-3.5" />
									<span>Déconnexion</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</nav>
				</div>
			</header>

			{isMenuOpen && (
				<div
					className={cn(
						"md:hidden fixed inset-0 z-30 bg-background/98 print:hidden",
						isDemoMode ? "pt-[72px]" : "pt-11",
					)}
				>
					<nav className="px-4 py-3 flex flex-col gap-1">
						<NavLink
							to="/"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Home className="h-4 w-4 text-slate-500" />
							Accueil
						</NavLink>
						<NavLink
							to="/patients"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<User className="h-4 w-4 text-slate-500" />
							Patients
						</NavLink>
						<NavLink
							to="/appointments"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Calendar className="h-4 w-4 text-slate-500" />
							Séances
						</NavLink>
						<NavLink
							to="/schedule"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Clock className="h-4 w-4 text-slate-500" />
							Planning
						</NavLink>
						<NavLink
							to="/invoices"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<FileText className="h-4 w-4 text-slate-500" />
							Factures
						</NavLink>
						<NavLink
							to="/statistics"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<BarChart3 className="h-4 w-4 text-slate-500" />
							Statistiques
						</NavLink>
						<div className="border-t my-2" />
						<NavLink
							to="/settings/profile"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<User className="h-4 w-4 text-slate-500" />
							Mon Profil
						</NavLink>
						<NavLink
							to="/settings/cabinet"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Building className="h-4 w-4 text-slate-500" />
							Paramètres cabinet
						</NavLink>
						<NavLink
							to="/settings"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
									isActive ? "bg-muted font-medium" : "",
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<HelpCircle className="h-4 w-4 text-slate-500" />
							Guide
						</NavLink>
						<button
							onClick={() => {
								handleLogout();
								setIsMenuOpen(false);
							}}
							className="p-2 rounded-md text-destructive flex items-center gap-2 text-sm"
						>
							<LogOut className="h-4 w-4" />
							Déconnexion
						</button>
					</nav>
				</div>
			)}

			<main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4 print:py-0">
				{children}
			</main>
		</div>
	);
}
