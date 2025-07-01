import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { api } from "@/services/api"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  professional_title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  rpps_number: z.string().optional(),
  siret: z.string().optional(),
  ape_code: z.string().optional(),
})

export function ProfileBillingForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      professional_title: "Ostéopathe D.O.",
      rpps_number: "",
      siret: "",
      ape_code: "8690F",
    },
  })

  useEffect(() => {
    const loadOsteopathData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Use the correct method name
        const osteopath = await api.getOsteopathByUserId?.(user.id);
        
        if (osteopath) {
          form.reset({
            name: osteopath.name || "",
            professional_title: osteopath.professional_title || "Ostéopathe D.O.",
            rpps_number: osteopath.rpps_number || "",
            siret: osteopath.siret || "",
            ape_code: osteopath.ape_code || "8690F",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadOsteopathData();
  }, [user?.id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      if (!user?.osteopathId) {
        toast.error("Impossible de mettre à jour le profil")
        return
      }

      await api.updateOsteopath(user.osteopathId, {
        name: values.name,
        professional_title: values.professional_title,
        rpps_number: values.rpps_number,
        siret: values.siret,
        ape_code: values.ape_code,
      })

      toast.success("Profil mis à jour.")
    } catch (error) {
      toast.error("Une erreur est survenue.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="professional_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre professionnel</FormLabel>
              <FormControl>
                <Input placeholder="Votre titre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rpps_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro RPPS</FormLabel>
              <FormControl>
                <Input placeholder="Votre numéro RPPS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="siret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro SIRET</FormLabel>
              <FormControl>
                <Input placeholder="Votre numéro SIRET" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ape_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code APE</FormLabel>
              <FormControl>
                <Input placeholder="Votre code APE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          Enregistrer
        </Button>
      </form>
    </Form>
  )
}
