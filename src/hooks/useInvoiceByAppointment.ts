
import { useState, useEffect } from "react";
import { invoiceService } from "@/services/api/invoice-service";
import { Invoice } from "@/types";

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
        setInvoice(invoices.length > 0 ? invoices[0] : null);
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
