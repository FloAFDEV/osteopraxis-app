import ConfirmDeleteCabinetModal from "@/components/modals/ConfirmDeleteCabinetModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { HelpButton } from "@/components/ui/help-button";
import { Layout } from "@/components/ui/layout";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
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
	Sparkles,
	Trash2,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CabinetsManagementPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [cabinets, setCabinets] = useState<Cabinet[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [cabinetToDelete, setCabinetToDelete] = useState<Cabinet | null>(
		null
	);
	const [osteopathData, setOsteopathData] = useState<Record<number, any>>({});

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
				className={`w-full h-48 overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-700 ${className}`}
			>
				{loading && !error && (
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

	// Vérifier si l'utilisateur est propriétaire du cabinet
	const isOwner = (cabinet: Cabinet) => {
		return cabinet.osteopathId === user?.osteopathId;
	};

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

	if (loading) {
		return (
			<Layout>
				<div className="min-h-screen bg-white dark:bg-gray-900">
					<div className="flex justify-center items-center py-20">
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
							<p className="text-muted-foreground text-lg">
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
			<div className="min-h-screen bg-white dark:bg-gray-900">
				{/* Header moderne avec couleurs du logo */}
				<div className="bg-gradient-to-br from-cyan-900 via-teal-800 to-blue-900 dark:from-emerald-900 dark:via-teal-800 dark:to-emerald-950 shadow-lg rounded-lg">
					<div className="container mx-auto px-6 py-8 bg-white/5 backdrop-blur-sm rounded-xl">
						<div className="flex items-center gap-4 mb-6">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate(-1)}
								className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour
							</Button>
						</div>

						<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
							<div className="space-y-2">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
										<Building2 className="h-8 w-8 text-green-500" />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h1 className="text-3xl font-bold text-white flex items-center gap-2">
												Gestion des Cabinets
												<Sparkles className="h-6 w-6 text-yellow-300" />
											</h1>
											<HelpButton
												content="Créez et gérez vos cabinets d'ostéopathie. En tant que propriétaire, vous pouvez inviter d'autres ostéopathes à rejoindre votre cabinet pour une pratique collaborative sécurisée."
												className="text-white/70 hover:text-white"
											/>
										</div>
										<p className="text-white/80 text-lg">
											Gérez vos cabinets d'ostéopathie
											avec style
										</p>
									</div>
								</div>
							</div>

							<Button
								asChild
								size="lg"
								className="bg-white text-teal-600 hover:bg-gray-200 shadow-lg dark:bg-gray-800 dark:text-teal-400 dark:hover:bg-gray-700"
							>
								<Link
									to="/cabinets/new"
									className="flex items-center gap-2"
								>
									<Plus className="h-5 w-5" />
									Nouveau Cabinet
								</Link>
							</Button>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-6 py-8">
					{cabinets.length === 0 ? (
						<div className="max-w-md mx-auto">
							<Card className="text-center border-2 border-dashed border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-800 shadow-sm">
								<CardContent className="py-12">
									<div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 rounded-full flex items-center justify-center">
										<Building2 className="h-10 w-10 text-teal-600 dark:text-teal-400" />
									</div>
									<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
										Aucun cabinet trouvé
									</h3>
									<p className="text-muted-foreground mb-6">
										Commencez par créer votre premier
										cabinet d'ostéopathie et développez
										votre pratique
									</p>
									<Button
										asChild
										size="lg"
										className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
									>
										<Link to="/cabinets/new">
											<Plus className="mr-2 h-5 w-5" />
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
									className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
								>
									{cabinet.imageUrl && (
										<div className="relative overflow-hidden">
											<ImageWithLoader
												src={cabinet.imageUrl}
												alt={cabinet.name}
												className="rounded-t-lg transition-transform duration-300 group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>
									)}

									<CardHeader className="pb-4">
										<div className="flex items-start gap-4">
											{cabinet.logoUrl ? (
												<div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md">
													<img
														src={cabinet.logoUrl}
														alt="Logo"
														className="w-full h-full object-contain bg-white"
													/>
												</div>
											) : (
												<div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 rounded-xl flex items-center justify-center shrink-0 shadow-md">
													<Building2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
														{cabinet.name}
													</h3>
													{isOwner(cabinet) && (
														<Badge
															variant="outline"
															className="text-xs bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
														>
															Propriétaire
														</Badge>
													)}
												</div>
												{osteopathData[
													cabinet.osteopathId
												] && (
													<p className="text-sm text-teal-600 dark:text-teal-400 font-medium mt-1">
														DO.{" "}
														{
															osteopathData[
																cabinet
																	.osteopathId
															].name
														}
													</p>
												)}
											</div>
										</div>
									</CardHeader>

									<CardContent className="pt-0 space-y-4">
										<div className="space-y-3">
											<div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
												<MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
												<span className="text-gray-700 dark:text-gray-300 text-sm">
													{cabinet.address}
												</span>
											</div>

											{cabinet.phone && (
												<div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
													<Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
													<span className="text-gray-700 dark:text-gray-300 text-sm">
														{cabinet.phone}
													</span>
												</div>
											)}

											{cabinet.email && (
												<div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
													<Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
													<span className="text-gray-700 dark:text-gray-300 text-sm break-all">
														{cabinet.email}
													</span>
												</div>
											)}
										</div>

										{osteopathData[cabinet.osteopathId] && (
											<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
												<h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
													<FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
													Informations
													professionnelles
												</h4>
												<div className="flex flex-wrap gap-2">
													{osteopathData[
														cabinet.osteopathId
													].siret && (
														<TooltipProvider>
															<Tooltip>
																<TooltipContent>
																	<p>
																		{
																			osteopathData[
																				cabinet
																					.osteopathId
																			]
																				.siret
																		}
																	</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													)}

													{osteopathData[
														cabinet.osteopathId
													]?.siret && (
														<div className="flex items-center gap-2">
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger
																		asChild
																	>
																		<Badge
																			variant="outline"
																			className="text-xs bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
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
																				]
																					.siret
																			}
																		</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
															<span className="text-sm text-muted-foreground dark:text-gray-300">
																{
																	osteopathData[
																		cabinet
																			.osteopathId
																	].siret
																}
															</span>
														</div>
													)}

													{osteopathData[
														cabinet.osteopathId
													]?.rpps_number && (
														<div className="flex items-center gap-2">
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger
																		asChild
																	>
																		<Badge
																			variant="outline"
																			className="text-xs bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
																		>
																			RPPS
																		</Badge>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>
																			{
																				osteopathData[
																					cabinet
																						.osteopathId
																				]
																					.rpps_number
																			}
																		</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
															<span className="text-sm text-muted-foreground dark:text-gray-300">
																{
																	osteopathData[
																		cabinet
																			.osteopathId
																	]
																		.rpps_number
																}
															</span>
														</div>
													)}

													{osteopathData[
														cabinet.osteopathId
													]?.ape_code && (
														<div className="flex items-center gap-2">
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger
																		asChild
																	>
																		<Badge
																			variant="outline"
																			className="text-xs bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
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
															<span className="text-sm text-muted-foreground dark:text-gray-300">
																{
																	osteopathData[
																		cabinet
																			.osteopathId
																	].ape_code
																}
															</span>
														</div>
													)}
												</div>
											</div>
										)}
									</CardContent>

									<CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-600">
										<div className="flex flex-col gap-3 w-full">
											{/* Première ligne : Modifier et Supprimer */}
											<div className="flex justify-between gap-3">
												<Button
													variant="outline"
													size="sm"
													asChild
													className="flex-1 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
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
													className="flex-1 bg-red-500 hover:bg-red-600 transition-colors"
													onClick={() =>
														confirmDelete(cabinet)
													}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Supprimer
												</Button>
											</div>

											{/* Deuxième ligne : Invitations (uniquement pour les propriétaires) */}
											{isOwner(cabinet) && (
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														asChild
														className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
													>
														<Link
															to={`/cabinets/${cabinet.id}/invitations`}
															className="flex items-center justify-center gap-2"
														>
															<Users className="h-4 w-4" />
															Invitations
														</Link>
													</Button>
													<HelpButton
														content="En tant que propriétaire, générez des codes d'invitation sécurisés pour inviter d'autres ostéopathes à rejoindre votre cabinet. Parfait pour la collaboration en équipe !"
														size="sm"
													/>
												</div>
											)}
										</div>
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
