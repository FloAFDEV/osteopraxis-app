import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { api } from "@/services/api";
import { Cabinet, Osteopath } from "@/types";
import { toast } from "sonner";

const EditCabinetPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
	const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCabinetData = async () => {
			setLoading(true);
			try {
				if (!id) {
					toast.error("Cabinet ID is missing.");
					return;
				}

				const cabinetId = parseInt(id, 10);
				const cabinet = await api.getCabinetById(cabinetId);

				if (!cabinet) {
					toast.error("Cabinet not found.");
					navigate("/cabinets");
					return;
				}

				setCabinetData(cabinet);

				// Fetch osteopath data
				const osteopathData = await api.getOsteopathById(
					cabinet.osteopathId
				);
				setOsteopath(osteopathData);
			} catch (error) {
				console.error("Error fetching cabinet data:", error);
				toast.error(
					"Failed to load cabinet data. Please try again later."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchCabinetData();
	}, [id, navigate]);

	const handleSaveCabinet = async (cabinet: Cabinet) => {
		try {
			if (!cabinetData) {
				toast.error("No cabinet data available to update.");
				return;
			}

			// Update the cabinet using the API
			await api.updateCabinet(cabinetData.id, cabinet);

			toast.success("Cabinet updated successfully!");
			navigate("/cabinets"); // Redirect to the cabinets list page
		} catch (error) {
			console.error("Error updating cabinet:", error);
			toast.error("Failed to update cabinet. Please try again.");
		}
	};

	const osteopathId = osteopath?.id;

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
				</div>
			</Layout>
		);
	}

	if (!cabinetData) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<p>Cabinet not found</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="container max-w-4xl mx-auto py-10">
				<h1 className="text-2xl font-bold mb-4">Edit Cabinet</h1>
				{cabinetData && (
					<CabinetForm
						defaultValues={{
							name: cabinetData.name,
							address: cabinetData.address,
							phone: cabinetData.phone,
							email: cabinetData.email || "",
							imageUrl: cabinetData.imageUrl || "",
							logoUrl: cabinetData.logoUrl || "",
							osteopathId: cabinetData.osteopathId || osteopathId,
							siret: osteopath?.siret,
							adeliNumber: osteopath?.adeli_number,
							apeCode: osteopath?.ape_code,
							city: cabinetData.city || '',
							province: cabinetData.province || '',
							postalCode: cabinetData.postalCode || '',
							country: cabinetData.country || '',
						}}
						cabinetId={cabinetData.id}
						isEditing={true}
						osteopathId={osteopathId}
						onSave={handleSaveCabinet}
					/>
				)}
			</div>
		</Layout>
	);
};

export default EditCabinetPage;
