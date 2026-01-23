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
	const { user, signOut, isDemoMode, demoCabinetName, remainingDemoTime } = useAuth();

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
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	return (
		<div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
			{isDemoMode && (
				<div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
					MODE DÉMO • {demoCabinetName} • Temps restant: {formatRemainingTime(remainingDemoTime)}
				</div>
			)}

			<header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b print:hidden">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<NavLink
							to="/"
							className="flex items-center gap-2 font-semibold text-3xl"
						>
							<Activity className="h-5 w-5 text-blue-500" />
							<h1 className="text-2xl font-extrabold tracking-tight">
								<span className="text-foreground">OstéoPraxis</span>
							</h1>
						</NavLink>
					</div>

					<div className="flex items-center gap-3">
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
						<NavLink
							to="/invoices"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-emerald-500"
										: "hover:text-emerald-500 text-muted-foreground"
								)
							}
						>
							<FileText className="h-4 w-4 text-emerald-500" />
							Notes d'honoraires
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
											className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold transition-colors duration-150 group-hover:text-amber-300 group-hover:bg-transparent"
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
										to="/settings/profile"
										className="flex items-center cursor-pointer hover:border hover:border-white/20 hover:shadow-sm rounded-sm"
									>
										<User className="mr-2 h-4 w-4 text-blue-500" />
										<span>Mon Profil</span>
									</NavLink>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings"
										className="flex items-center cursor-pointer hover:border hover:border-white/20 hover:shadow-sm rounded-sm"
									>
										<HelpCircle className="mr-2 h-4 w-4 text-orange-500" />
										<span>Guide</span>
									</NavLink>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<NavLink
										to="/settings/cabinet"
										className="flex items-center cursor-pointer hover:border hover:border-white/20 hover:shadow-sm rounded-sm"
									>
										<Building className="mr-2 h-4 w-4 text-green-500" />
										<span>Paramètres du cabinet</span>
									</NavLink>
								</DropdownMenuItem>

								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-destructive cursor-pointer hover:bg-red-600 hover:text-white hover:font-bold hover:border hover:border-white/20 hover:shadow-sm rounded-sm focus:text-destructive"
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
				<div className={cn(
					"md:hidden fixed inset-0 z-30 bg-background/95 print:hidden",
					isDemoMode ? "pt-[104px]" : "pt-16"
				)}>
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
							to="/settings/profile"
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
							<User className="h-5 w-5 text-blue-500" />
							Mon Profil
						</NavLink>
						<NavLink
							to="/settings/cabinet"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-green-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<Building className="h-5 w-5 text-green-500" />
							Paramètres du cabinet
						</NavLink>
						<NavLink
							to="/settings"
							className={({ isActive }) =>
								cn(
									"p-2 rounded-md transition-colors flex items-center gap-2",
									isActive
										? "bg-orange-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<HelpCircle className="h-5 w-5 text-orange-500" />
							Guide
						</NavLink>
						<button
							onClick={() => {
								handleLogout();
								setIsMenuOpen(false);
							}}
							className="p-2 rounded-md text-destructive flex items-center gap-2 hover:bg-red-500/10"
						>
							<LogOut className="h-5 w-5" />
							Déconnexion
						</button>
					</nav>
				</div>
			)}

			<main className="flex-1 container py-6 print:py-0">
				{children}
			</main>
		</div>
	);
}
