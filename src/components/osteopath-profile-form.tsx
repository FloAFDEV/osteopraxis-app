
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileFormSchema = z.object({
	firstName: z.string().min(2, {
		message: "Le prénom doit comporter au moins 2 caractères.",
	}),
	lastName: z.string().min(2, {
		message: "Le nom de famille doit comporter au moins 2 caractères.",
	}),
	bio: z.string().optional(),
	website: z.string().url().optional(),
	linkedin: z.string().url().optional(),
	facebook: z.string().url().optional(),
	twitter: z.string().url().optional(),
	instagram: z.string().url().optional(),
	youtube: z.string().url().optional(),
	tiktok: z.string().url().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface OsteopathProfileFormProps {
	osteopathProfile?: any;
	onSave: (data: ProfileFormValues) => Promise<void>;
	isLoading?: boolean;
	connectedUser?: User | null;
	defaultValues?: any;
	osteopathId?: number;
	isEditing?: boolean;
	onSuccess?: (updatedOsteopath: any) => Promise<void>;
}

export function OsteopathProfileForm({
	osteopathProfile,
	onSave,
	isLoading = false,
	connectedUser,
}: OsteopathProfileFormProps) {
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: osteopathProfile?.firstName || "",
			lastName: osteopathProfile?.lastName || "",
			bio: osteopathProfile?.bio || "",
			website: osteopathProfile?.website || "",
			linkedin: osteopathProfile?.linkedin || "",
			facebook: osteopathProfile?.facebook || "",
			twitter: osteopathProfile?.twitter || "",
			instagram: osteopathProfile?.instagram || "",
			youtube: osteopathProfile?.youtube || "",
			tiktok: osteopathProfile?.tiktok || "",
		},
	});

	useEffect(() => {
		if (connectedUser) {
			// Utilisez firstName et lastName au lieu de first_name et last_name
			form.setValue("firstName", connectedUser.firstName || "");
			form.setValue("lastName", connectedUser.lastName || "");
		}
	}, [connectedUser, form]);

	const onSubmit = async (data: ProfileFormValues) => {
		try {
			await onSave(data);
			toast.success("Profil mis à jour avec succès!");
		} catch (error) {
			console.error("Erreur lors de la mise à jour du profil:", error);
			toast.error(
				"Une erreur est survenue lors de la mise à jour du profil"
			);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6 w-full"
			>
				<Card>
					<CardHeader>
						<CardTitle>Modifier votre profil</CardTitle>
						<CardDescription>
							Mettez à jour vos informations personnelles ici.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Prénom{" "}
											<span className="text-red-500">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Votre prénom"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Nom{" "}
											<span className="text-red-500">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Votre nom"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4">
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bio</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Une courte description de vous"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Site web</FormLabel>
										<FormControl>
											<Input
												placeholder="https://votre-site.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="linkedin"
								render={({ field }) => (
									<FormItem>
										<FormLabel>LinkedIn</FormLabel>
										<FormControl>
											<Input
												placeholder="https://linkedin.com/in/votre-profil"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="facebook"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Facebook</FormLabel>
										<FormControl>
											<Input
												placeholder="https://facebook.com/votre-page"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="twitter"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Twitter</FormLabel>
										<FormControl>
											<Input
												placeholder="https://twitter.com/votre-pseudo"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="instagram"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Instagram</FormLabel>
										<FormControl>
											<Input
												placeholder="https://instagram.com/votre-pseudo"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="youtube"
								render={({ field }) => (
									<FormItem>
										<FormLabel>YouTube</FormLabel>
										<FormControl>
											<Input
												placeholder="https://youtube.com/votre-chaine"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="tiktok"
								render={({ field }) => (
									<FormItem>
										<FormLabel>TikTok</FormLabel>
										<FormControl>
											<Input
												placeholder="https://tiktok.com/@votre-pseudo"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" type="button">
							Annuler
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
									Mise à jour...
								</>
							) : (
								"Mettre à jour"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
