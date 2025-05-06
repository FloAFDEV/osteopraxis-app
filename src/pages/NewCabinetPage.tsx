import { useContext, useEffect, useState } from "react";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Osteopath, User } from "@/types";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NewCabinetPageProps {}

const NewCabinetPage: React.FC<NewCabinetPageProps> = ({}) => {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const [osteopathId, setOsteopathId] = useState<number | null>(null);

	useEffect(() => {
		if (user && user.osteopathId) {
			setOsteopathId(user.osteopathId);
		}
	}, [user]);

	const handleSaveCabinet = async () => {
		toast.success("Cabinet créé avec succès!");
		navigate("/cabinets");
	};

	if (!osteopathId) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<p>
						Vous devez être connecté en tant qu'ostéopathe pour créer un
						cabinet.
					</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="container max-w-4xl mx-auto py-10">
				<h1 className="text-3xl font-bold mb-4">Créer un cabinet</h1>
				<CabinetForm 
          osteopathId={osteopathId} 
          onSave={handleSaveCabinet}
        />
			</div>
		</Layout>
	);
};

export default NewCabinetPage;
