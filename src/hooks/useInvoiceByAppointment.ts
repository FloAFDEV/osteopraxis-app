
import { useState, useEffect } from "react";
import { invoiceService } from "@/services/api/invoice-service";
import { Invoice } from "@/types";
import { DEMO_OSTEOPATH_ID } from '@/config/demo-constants';

export function useInvoiceByAppointment(appointmentId: number | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérification de l'ID rendez-vous avant toute opération
    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      setInvoice(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const invoices = await invoiceService.getInvoicesByAppointmentId(appointmentId);
        const invoiceData = invoices.length > 0 ? invoices[0] : null;
        
        // En mode démo, ajouter des données fictives d'ostéopathe avec tampon
        if (invoiceData && (invoiceData.osteopathId === DEMO_OSTEOPATH_ID || window.location.hostname === 'localhost')) {
          // Importer le tampon de démo
          const demoStampUrl = await import('@/assets/demo-stamp.png').then(module => module.default);
          
          // Ajouter les données démo
          (invoiceData as any).osteopath = {
            id: 999,
            name: 'Dr. Marie DUBOIS',
            professional_title: 'Ostéopathe D.O.',
            rpps_number: '12345678901',
            siret: '12345678901234',
            stampUrl: demoStampUrl
          };
          
          (invoiceData as any).cabinet = {
            id: 1,
            name: 'Cabinet Ostéopathique Démo',
            address: '123 Rue de la Santé, 75000 Paris',
            phone: '01.23.45.67.89',
            email: 'contact@cabinet-demo.fr',
            logoUrl: null
          };
        }
        
        setInvoice(invoiceData);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de la facture");
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [appointmentId]);

  return { invoice, loading, error };
}
