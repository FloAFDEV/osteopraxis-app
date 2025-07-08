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
	Shield,
	LogOut,
	Menu,
	X,
	Activity,
	BarChart3,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const { user, logout } = useAuth();

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
			<header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<NavLink
							to="/admin"
							className="flex items-center gap-2 font-semibold text-3xl"
						>
							<Shield className="h-5 w-5 text-red-500" />
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 font-bold">
								Admin Panel
							</span>
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
							to="/admin"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-red-500"
										: "hover:text-red-500 text-muted-foreground"
								)
							}
						>
							<Shield className="h-4 w-4 text-red-500" />
							Administration
						</NavLink>
						<NavLink
							to="/admin/dashboard"
							className={({ isActive }) =>
								cn(
									"text-sm font-medium transition-colors flex items-center gap-1",
									isActive
										? "text-purple-500"
										: "hover:text-purple-500 text-muted-foreground"
								)
							}
						>
							<BarChart3 className="h-4 w-4 text-purple-500" />
							Dashboard
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
										<AvatarFallback className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-primary-foreground">
											{getInitials()}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>
									Administrateur
								</DropdownMenuLabel>
								{user && (
									<div className="px-2 py-1.5 text-sm text-muted-foreground">
										{user.email}
									</div>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-destructive focus:text-destructive cursor-pointer"
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
				<div className="md:hidden fixed inset-0 z-30 bg-background/95 pt-16">
					<nav className="container py-4 flex flex-col gap-4">
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
										? "bg-purple-500/10 text-foreground"
										: "text-foreground"
								)
							}
							onClick={() => setIsMenuOpen(false)}
						>
							<BarChart3 className="h-5 w-5 text-purple-500" />
							Dashboard
						</NavLink>

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

			<main className="flex-1 container px-4 md:px-6 py-6">
				{children}
			</main>

			<footer className="border-t py-6 bg-muted/30">
				<div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
					<p>© 2025 Admin Panel. Tous droits réservés.</p>
				</div>
			</footer>
		</div>
	);
}