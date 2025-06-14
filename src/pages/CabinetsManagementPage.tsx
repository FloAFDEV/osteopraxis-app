
import ConfirmDeleteCabinetModal from "@/components/modals/ConfirmDeleteCabinetModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Layout } from "@/components/ui/layout";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import {
	ArrowLeft,
	Building2,
	Edit,
	FileText,
	Mail,
	MapPin,
	Phone,
	Plus,
	Trash2,
	Stethoscope,
	Heart,
	Leaf,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CabinetsManagementPage = () => {
	const navigate = useNavigate();
	const [cabinets, setCabinets] = useState<Cabinet[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [cabinetToDelete, setCabinetToDelete] = useState<Cabinet | null>(
		null
	);
	const [osteopathData, setOsteopathData] = useState<Record<number, any>>({});

	useEffect(() => {
		const fetchCabinets = async () => {
			try {
				const cabinetData = await api.getCabinets();
				setCabinets(cabinetData);

				// Fetch osteopath data for each cabinet to get billing information
				const osteopathIds = [
					...new Set(cabinetData.map((c) => c.osteopathId)),
				];
				const osteopathInfo: Record<number, any> = {};

				for (const id of osteopathIds) {
					const data = await api.getOsteopathById(id);
					if (data) {
						osteopathInfo[id] = data;
					}
				}

				setOsteopathData(osteopathInfo);
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des cabinets:",
					error
				);
				toast.error(
					"Impossible de charger les cabinets. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchCabinets();
	}, []);

	const confirmDelete = (cabinet: Cabinet) => {
		setCabinetToDelete(cabinet);
		setDeleteModalOpen(true);
	};

	const handleDelete = async () => {
		if (!cabinetToDelete) return;
		try {
			await api.deleteCabinet(cabinetToDelete.id);
			setCabinets(cabinets.filter((c) => c.id !== cabinetToDelete.id));
			toast.success("Cabinet supprimé avec succès");
		} catch (error) {
			console.error("Erreur lors de la suppression du cabinet:", error);
			toast.error(
				"Impossible de supprimer le cabinet. Veuillez réessayer."
			);
		} finally {
			setDeleteModalOpen(false);
			setCabinetToDelete(null);
		}
	};

	const ImageWithLoader = ({
		src,
		alt,
		className,
	}: {
		src: string;
		alt: string;
		className?: string;
	}) => {
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState(false);

		return (
			<div
				className={`w-full h-48 overflow-hidden flex justify-center items-center bg-sage-50 dark:bg-gray-700 ${className}`}
			>
				{loading && !error && (
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
				)}
				{error && !loading && (
					<p className="text-sm text-red-500">Image non disponible</p>
				)}
				<img
					src={src}
					alt={alt}
					className={`w-full h-full object-cover ${
						loading || error ? "hidden" : "block"
					}`}
					onLoad={() => setLoading(false)}
					onError={() => {
						setLoading(false);
						setError(true);
					}}
				/>
			</div>
		);
	};

	if (loading) {
		return (
			<Layout>
				<div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-sage-100 dark:from-gray-900 dark:to-gray-800">
					<div className="flex justify-center items-center py-20">
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto"></div>
							<p className="text-sage-600 dark:text-sage-400 text-lg font-medium">
								Chargement de vos cabinets...
							</p>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-sage-100 dark:from-gray-900 dark:to-gray-800 relative">
				{/* Subtle background pattern */}
				<div className="absolute inset-0 opacity-5 dark:opacity-10" 
					 style={{
						 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					 }}
				/>

				{/* Header with medical/wellness theme */}
				<div className="relative bg-gradient-to-r from-sage-600 via-emerald-600 to-teal-600 dark:from-sage-700 dark:via-emerald-700 dark:to-teal-700 shadow-xl">
					<div className="absolute inset-0 bg-black/5"></div>
					<div className="container mx-auto px-6 py-12 relative">
						<div className="flex items-center gap-4 mb-6">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate(-1)}
								className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm transition-all duration-200"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour
							</Button>
						</div>
						
						<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
							<div className="space-y-4">
								<div className="flex items-center gap-4">
									<div className="p-4 bg-white/15 rounded-2xl backdrop-blur-sm shadow-lg">
										<Building2 className="h-10 w-10 text-white" />
									</div>
									<div>
										<h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
											Gestion des Cabinets
											<Stethoscope className="h-8 w-8 text-emerald-200" />
										</h1>
										<p className="text-white/90 text-xl flex items-center gap-2">
											<Heart className="h-5 w-5 text-rose-200" />
											Votre espace de soins ostéopathiques
											<Leaf className="h-5 w-5 text-emerald-200" />
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 text-white/80">
									<div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
									<span className="text-sm">Environnement sécurisé et professionnel</span>
								</div>
							</div>
							
							<Button asChild size="lg" className="bg-white text-sage-700 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
								<Link
									to="/cabinets/new"
									className="flex items-center gap-3 px-8 py-4 rounded-xl"
								>
									<Plus className="h-6 w-6" />
									<span className="font-semibold">Nouveau Cabinet</span>
								</Link>
							</Button>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-6 py-12 relative">
					{cabinets.length === 0 ? (
						<div className="max-w-lg mx-auto">
							<Card className="text-center border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-2xl">
								<CardContent className="py-16">
									<div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-sage-100 to-emerald-100 dark:from-sage-900 dark:to-emerald-900 rounded-3xl flex items-center justify-center shadow-lg">
										<Building2 className="h-12 w-12 text-sage-600 dark:text-sage-400" />
									</div>
									<h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
										Aucun cabinet trouvé
									</h3>
									<p className="text-sage-600 dark:text-sage-400 mb-8 leading-relaxed">
										Créez votre premier cabinet d'ostéopathie et commencez à développer 
										votre pratique dans un environnement professionnel et apaisant
									</p>
									<Button asChild size="lg" className="bg-gradient-to-r from-sage-500 to-emerald-500 hover:from-sage-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300">
										<Link to="/cabinets/new" className="px-8 py-4">
											<Plus className="mr-3 h-6 w-6" />
											Créer mon premier cabinet
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
							{cabinets.map((cabinet) => (
								<Card
									key={cabinet.id}
									className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sage-200/50 dark:border-gray-600 shadow-xl hover:bg-white/90"
								>
									{cabinet.imageUrl && (
										<div className="relative overflow-hidden">
											<ImageWithLoader
												src={cabinet.imageUrl}
												alt={cabinet.name}
												className="rounded-t-lg transition-transform duration-500 group-hover:scale-110"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
										</div>
									)}

									<CardHeader className="pb-4">
										<div className="flex items-start gap-4">
											{cabinet.logoUrl ? (
												<div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-lg ring-4 ring-sage-100 dark:ring-sage-800">
													<img
														src={cabinet.logoUrl}
														alt="Logo"
														className="w-full h-full object-contain bg-white"
													/>
												</div>
											) : (
												<div className="w-16 h-16 bg-gradient-to-br from-sage-100 to-emerald-100 dark:from-sage-900 dark:to-emerald-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ring-4 ring-sage-100 dark:ring-sage-800">
													<Building2 className="h-8 w-8 text-sage-600 dark:text-sage-400" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
													{cabinet.name}
												</h3>
												{osteopathData[
													cabinet.osteopathId
												] && (
													<p className="text-sm text-sage-600 dark:text-sage-400 font-medium flex items-center gap-1">
														<Stethoscope className="h-3 w-3" />
														Dr. {
															osteopathData[
																cabinet.osteopathId
															].name
														}
													</p>
												)}
											</div>
										</div>
									</CardHeader>

									<CardContent className="pt-0 space-y-4">
										<div className="space-y-3">
											<div className="flex items-start gap-3 p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/50">
												<MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
												<span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
													{cabinet.address}
												</span>
											</div>

											{cabinet.phone && (
												<div className="flex items-center gap-3 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/50">
													<Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
													<span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
														{cabinet.phone}
													</span>
												</div>
											)}

											{cabinet.email && (
												<div className="flex items-center gap-3 p-4 bg-purple-50/80 dark:bg-purple-900/20 rounded-xl border border-purple-200/50">
													<Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
													<span className="text-gray-700 dark:text-gray-300 text-sm font-medium break-all">
														{cabinet.email}
													</span>
												</div>
											)}
										</div>

										{osteopathData[cabinet.osteopathId] && (
											<div className="pt-4 border-t border-sage-200/50 dark:border-gray-600">
												<h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
													<FileText className="h-4 w-4 text-sage-600 dark:text-sage-400" />
													Informations professionnelles
												</h4>
												<div className="flex flex-wrap gap-2">
													{osteopathData[
														cabinet.osteopathId
													].siret && (
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger>
																	<Badge
																		variant="outline"
																		className="text-xs bg-sage-50/80 border-sage-200 text-sage-700 dark:bg-sage-900/20 dark:border-sage-800 dark:text-sage-300 hover:bg-sage-100"
																	>
																		SIRET
																	</Badge>
																</TooltipTrigger>
																<TooltipContent>
																	<p>
																		{
																			osteopathData[
																				cabinet
																					.osteopathId
																			].siret
																		}
																	</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													)}

													{osteopathData[
														cabinet.osteopathId
													].adeli_number && (
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger>
																	<Badge
																		variant="outline"
																		className="text-xs bg-emerald-50/80 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
																	>
																		ADELI
																	</Badge>
																</TooltipTrigger>
																<TooltipContent>
																	<p>
																		{
																			osteopathData[
																				cabinet
																					.osteopathId
																			]
																				.adeli_number
																		}
																	</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													)}

													{osteopathData[
														cabinet.osteopathId
													].ape_code && (
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger>
																	<Badge
																		variant="outline"
																		className="text-xs bg-teal-50/80 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300 hover:bg-teal-100"
																	>
																		APE
																	</Badge>
																</TooltipTrigger>
																<TooltipContent>
																	<p>
																		{
																			osteopathData[
																				cabinet
																					.osteopathId
																			]
																				.ape_code
																		}
																	</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													)}
												</div>
											</div>
										)}
									</CardContent>

									<CardFooter className="bg-gradient-to-r from-sage-50/50 to-emerald-50/50 dark:from-sage-900/20 dark:to-emerald-900/20 p-4 border-t border-sage-200/30 dark:border-sage-600/30 flex justify-between gap-3">
										<Button 
											variant="outline" 
											size="sm" 
											asChild
											className="flex-1 hover:bg-sage-50 hover:border-sage-300 hover:text-sage-700 transition-all duration-200 bg-white/80 backdrop-blur-sm"
										>
											<Link
												to={`/cabinets/${cabinet.id}/edit`}
												className="flex items-center justify-center gap-2"
											>
												<Edit className="h-4 w-4" />
												Modifier
											</Link>
										</Button>
										<Button
											variant="destructive"
											size="sm"
											className="flex-1 bg-red-500/90 hover:bg-red-600 transition-all duration-200 backdrop-blur-sm"
											onClick={() => confirmDelete(cabinet)}
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Supprimer
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
			
			<ConfirmDeleteCabinetModal
				isOpen={deleteModalOpen}
				cabinetName={cabinetToDelete?.name}
				onCancel={() => setDeleteModalOpen(false)}
				onDelete={handleDelete}
			/>
		</Layout>
	);
};

export default CabinetsManagementPage;
