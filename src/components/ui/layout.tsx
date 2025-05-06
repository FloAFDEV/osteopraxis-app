import {
	useEffect,
	useState,
	forwardRef,
	useContext,
	useRef,
	useCallback,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { SidebarNav } from "@/components/sidebar-nav";
import { authConfig } from "@/auth.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { api } from "@/services/api";
import { User } from "@/types";
import { AuthContext } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: DashboardLayoutProps) {
	const { isAuthenticated, user, logout } = useAuth();
	const { toast } = useToast();
	const { isMobile } = useIsMobile();
	const navigate = useNavigate();
	const location = useLocation();
	const [isSidebarOpen, setSidebarOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			toast({
				title: "Déconnexion réussie!",
				description: "Vous avez été déconnecté avec succès.",
			});
			navigate(authConfig.pages.signIn);
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Erreur de déconnexion",
				description:
					"Une erreur s'est produite lors de la déconnexion. Veuillez réessayer.",
			});
		}
	};

	useEffect(() => {
		setSidebarOpen(false);
	}, [location.pathname]);

	return (
		<div className="flex min-h-screen flex-col">
			<header className="w-full border-b">
				<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
					{isMobile ? (
						<Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="px-0 lg:hidden"
								>
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="pr-0 pt-0 bg-white dark:bg-gray-900"
							>
								<SheetHeader className="pl-6 pr-8 pt-6">
									<SheetTitle>Menu</SheetTitle>
								</SheetHeader>
								<SidebarNav className="p-6 pt-0" />
							</SheetContent>
						</Sheet>
					) : (
						<SidebarNav className="hidden lg:block" />
					)}
					<MainNav className="mx-auto w-full sm:mr-0 sm:ml-4" />
					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative h-8 w-8 rounded-full">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src="/avatars/01.png"
											alt={`${user.firstName} ${user.lastName}`}
										/>
										<AvatarFallback>
											{user.firstName ? user.firstName.charAt(0) : ""}
											{user.lastName ? user.lastName.charAt(0) : ""}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuItem asChild>
									<Link to="/profile">Profil</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/settings">Paramètres</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									Se déconnecter
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center space-x-2">
							<Link to={authConfig.pages.signIn} className="text-sm font-medium">
								Se connecter
							</Link>
							<Link
								to={authConfig.pages.newUser}
								className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
							>
								S'inscrire
							</Link>
						</div>
					)}
				</div>
			</header>
			<main className="flex-1">
				<div className="container py-6">{children}</div>
			</main>
			<SiteFooter />
		</div>
	);
}
