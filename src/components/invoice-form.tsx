
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient, PaymentStatus } from '@/types';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Define the form schema with Zod
const formSchema = z.object({
  patientId: z.number(),
  consultationId: z.number().optional(),
  amount: z.number().min(0, "Le montant doit être positif"),
  date: z.string(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'CANCELED']),
  paymentMethod: z.string().optional(),
  tvaExoneration: z.boolean().optional(),
  tvaMotif: z.string().optional(),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  patient: Patient;
  onCreate: () => void;
}

export const InvoiceForm = ({ patient, onCreate }: InvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = {
    patientId: patient.id,
    consultationId: 0, // Default to 0, will be updated if needed
    amount: 60, // Default amount for a consultation
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentStatus: 'PAID',
    paymentMethod: 'CB',
    tvaExoneration: true,
    tvaMotif: 'TVA non applicable - Article 261-4-1° du CGI',
    notes: ''
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await api.createInvoice({
        patientId: data.patientId,
        consultationId: data.consultationId || 0,
        amount: data.amount,
        date: data.date,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: data.paymentMethod,
        tvaExoneration: data.tvaExoneration,
        tvaMotif: data.tvaMotif,
        notes: data.notes
      });
      toast.success("Facture créée avec succès");
      onCreate();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Erreur lors de la création de la facture");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient info (display only) */}
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <h3 className="font-medium mb-2">Informations du patient</h3>
              <p>
                <span className="text-muted-foreground">Nom:</span> {patient.lastName}
              </p>
              <p>
                <span className="text-muted-foreground">Prénom:</span> {patient.firstName}
              </p>
              {patient.email && (
                <p>
                  <span className="text-muted-foreground">Email:</span> {patient.email}
                </p>
              )}
            </div>
          </div>

          {/* Invoice amount */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="60.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Payment status */}
        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut de paiement</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PAID">Payée</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CANCELED">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment method */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode de paiement</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mode de paiement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CB">Carte bancaire</SelectItem>
                  <SelectItem value="ESPECES">Espèces</SelectItem>
                  <SelectItem value="CHEQUE">Chèque</SelectItem>
                  <SelectItem value="VIREMENT">Virement</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TVA Motif */}
        <FormField
          control={form.control}
          name="tvaMotif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif d'exonération TVA</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes complémentaires</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCreate}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer la facture"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
