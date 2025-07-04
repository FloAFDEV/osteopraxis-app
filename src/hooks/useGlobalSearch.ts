import { useState, useEffect, useCallback, useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import Fuse from "fuse.js";

type Patient = Tables<"Patient">;
type Appointment = Tables<"Appointment">;
type Invoice = Tables<"Invoice">;

export interface SearchResult {
  id: string;
  type: "patient" | "appointment" | "invoice";
  title: string;
  subtitle: string;
  data: Patient | Appointment | Invoice;
  score?: number;
}

export interface GlobalSearchOptions {
  includePatients?: boolean;
  includeAppointments?: boolean;
  includeInvoices?: boolean;
  limit?: number;
  fuzzySearch?: boolean;
}

export interface UseGlobalSearchReturn {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, options?: GlobalSearchOptions) => void;
  clearResults: () => void;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allData, setAllData] = useState({
    patients: [] as Patient[],
    appointments: [] as Appointment[],
    invoices: [] as Invoice[]
  });

  // Charger toutes les données au démarrage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [patientsResult, appointmentsResult, invoicesResult] = await Promise.all([
        supabase.from("Patient").select("*"),
        supabase.from("Appointment").select("*"),
        supabase.from("Invoice").select("*")
      ]);

      setAllData({
        patients: patientsResult.data || [],
        appointments: appointmentsResult.data || [],
        invoices: invoicesResult.data || []
      });
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    }
  };

  // Configuration Fuse.js pour la recherche floue
  const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Seuil de similarité
    ignoreLocation: true,
    useExtendedSearch: true,
    keys: {
      patients: [
        { name: "firstName", weight: 0.3 },
        { name: "lastName", weight: 0.3 },
        { name: "email", weight: 0.2 },
        { name: "phone", weight: 0.1 },
        { name: "notes", weight: 0.1 }
      ],
      appointments: [
        { name: "reason", weight: 0.4 },
        { name: "notes", weight: 0.3 },
        { name: "status", weight: 0.3 }
      ],
      invoices: [
        { name: "notes", weight: 0.4 },
        { name: "paymentMethod", weight: 0.3 },
        { name: "paymentStatus", weight: 0.3 }
      ]
    }
  };

  // Instances Fuse pour chaque type de données
  const fuseInstances = useMemo(() => ({
    patients: new Fuse(allData.patients, {
      ...fuseOptions,
      keys: fuseOptions.keys.patients
    }),
    appointments: new Fuse(allData.appointments, {
      ...fuseOptions,
      keys: fuseOptions.keys.appointments
    }),
    invoices: new Fuse(allData.invoices, {
      ...fuseOptions,
      keys: fuseOptions.keys.invoices
    })
  }), [allData]);

  const formatPatientResult = (patient: Patient): SearchResult => ({
    id: `patient-${patient.id}`,
    type: "patient",
    title: `${patient.firstName} ${patient.lastName}`,
    subtitle: `${patient.email || "Pas d'email"} • ${patient.phone || "Pas de téléphone"}`,
    data: patient
  });

  const formatAppointmentResult = (appointment: Appointment): SearchResult => {
    const patient = allData.patients.find(p => p.id === appointment.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu";
    
    return {
      id: `appointment-${appointment.id}`,
      type: "appointment",
      title: `RDV: ${appointment.reason}`,
      subtitle: `${patientName} • ${new Date(appointment.date).toLocaleDateString("fr-FR")} • ${appointment.status}`,
      data: appointment
    };
  };

  const formatInvoiceResult = (invoice: Invoice): SearchResult => {
    const patient = allData.patients.find(p => p.id === invoice.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu";
    
    return {
      id: `invoice-${invoice.id}`,
      type: "invoice",
      title: `Facture ${invoice.id} • ${invoice.amount}€`,
      subtitle: `${patientName} • ${new Date(invoice.date).toLocaleDateString("fr-FR")} • ${invoice.paymentStatus}`,
      data: invoice
    };
  };

  const performSimpleSearch = (
    query: string,
    options: GlobalSearchOptions
  ): SearchResult[] => {
    const {
      includePatients = true,
      includeAppointments = true,
      includeInvoices = true,
      limit = 20
    } = options;

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Recherche dans les patients
    if (includePatients) {
      allData.patients.forEach(patient => {
        const searchableText = `${patient.firstName} ${patient.lastName} ${patient.email} ${patient.phone} ${patient.notes}`.toLowerCase();
        if (searchableText.includes(lowerQuery)) {
          results.push(formatPatientResult(patient));
        }
      });
    }

    // Recherche dans les rendez-vous
    if (includeAppointments) {
      allData.appointments.forEach(appointment => {
        const patient = allData.patients.find(p => p.id === appointment.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
        const searchableText = `${appointment.reason} ${appointment.notes} ${appointment.status} ${patientName}`.toLowerCase();
        
        if (searchableText.includes(lowerQuery)) {
          results.push(formatAppointmentResult(appointment));
        }
      });
    }

    // Recherche dans les factures
    if (includeInvoices) {
      allData.invoices.forEach(invoice => {
        const patient = allData.patients.find(p => p.id === invoice.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
        const searchableText = `${invoice.notes} ${invoice.paymentMethod} ${invoice.paymentStatus} ${patientName} ${invoice.amount}`.toLowerCase();
        
        if (searchableText.includes(lowerQuery)) {
          results.push(formatInvoiceResult(invoice));
        }
      });
    }

    return results.slice(0, limit);
  };

  const performFuzzySearch = (
    query: string,
    options: GlobalSearchOptions
  ): SearchResult[] => {
    const {
      includePatients = true,
      includeAppointments = true,
      includeInvoices = true,
      limit = 20
    } = options;

    const results: SearchResult[] = [];

    // Recherche floue dans les patients
    if (includePatients) {
      const patientResults = fuseInstances.patients.search(query);
      patientResults.forEach(result => {
        const searchResult = formatPatientResult(result.item);
        searchResult.score = result.score;
        results.push(searchResult);
      });
    }

    // Recherche floue dans les rendez-vous
    if (includeAppointments) {
      const appointmentResults = fuseInstances.appointments.search(query);
      appointmentResults.forEach(result => {
        const searchResult = formatAppointmentResult(result.item);
        searchResult.score = result.score;
        results.push(searchResult);
      });
    }

    // Recherche floue dans les factures
    if (includeInvoices) {
      const invoiceResults = fuseInstances.invoices.search(query);
      invoiceResults.forEach(result => {
        const searchResult = formatInvoiceResult(result.item);
        searchResult.score = result.score;
        results.push(searchResult);
      });
    }

    // Trier par score et limiter
    return results
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, limit);
  };

  const search = useCallback((query: string, options: GlobalSearchOptions = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { fuzzySearch = true } = options;
      
      const searchResults = fuzzySearch 
        ? performFuzzySearch(query, options)
        : performSimpleSearch(query, options);

      setResults(searchResults);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError("Erreur lors de la recherche");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [allData, fuseInstances]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults
  };
}

// Hook pour la recherche avec debounce
export function useGlobalSearchWithDebounce(delay: number = 300): UseGlobalSearchReturn {
  const search = useGlobalSearch();
  const [debouncedSearch] = useState(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (query: string, options?: GlobalSearchOptions) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        search.search(query, options);
      }, delay);
    };
  });

  return {
    ...search,
    search: debouncedSearch
  };
}