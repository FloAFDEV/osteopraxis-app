import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ConfirmDeleteInvoiceModal from "@/components/modals/ConfirmDeleteInvoiceModal";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Cabinet, Invoice, Osteopath, Patient } from "@/types";

// Import our new components
import { InvoiceEmptyState } from "@/components/invoices/InvoiceEmptyState";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoicePrintWrapper } from "@/components/invoices/InvoicePrintWrapper";
import { InvoiceYearGroup } from "@/components/invoices/InvoiceYearGroup";
import { useInvoiceFiltering } from "@/hooks/useInvoiceFiltering";
import { useOsteopaths } from "@/hooks/useOsteopaths";
import { useCabinetsByOsteopath } from "@/hooks/useCabinetsByOsteopath";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { InvoiceExportButtons } from "@/components/invoices/InvoiceExportButtons";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
const InvoicesPage = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [printAllInvoices, setPrintAllInvoices] = useState<Invoice[] | null>(null);
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);
  const [printOsteopath, setPrintOsteopath] = useState<Osteopath | null>(null);
  const [printCabinet, setPrintCabinet] = useState<Cabinet | null>(null);

  // State for print handling
  const [readyToPrint, setReadyToPrint] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [patientDataMap, setPatientDataMap] = useState<Map<number, Patient>>(new Map());
  const [osteopathDataMap, setOsteopathDataMap] = useState<Map<number, Osteopath>>(new Map());
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | "ALL" | null>(null);
  const [selectedOsteopathId, setSelectedOsteopathId] = useState<number | "ALL" | null>(null);
  const {
    osteopaths
  } = useOsteopaths();
  const {
    cabinets
  } = useCabinetsByOsteopath(selectedOsteopathId && selectedOsteopathId !== "ALL" ? Number(selectedOsteopathId) : undefined);
  // Récupération des factures (service original)
  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices
  } = useQuery({
    queryKey: ["invoices", user?.osteopathId],
    queryFn: async () => {
      if (!user?.osteopathId) return [];
      return await api.getInvoices();
    },
    enabled: !!user?.osteopathId,
    refetchOnWindowFocus: false,
  });

  // Query for osteopath data
  const {
    data: osteopath
  } = useQuery({
    queryKey: ["osteopath", user?.osteopathId],
    queryFn: () => user?.osteopathId ? api.getOsteopathById(user.osteopathId) : null,
    enabled: !!user?.osteopathId
  });

  // Nouveau filtrage selon ostéo/cabinet AVANT le filtrage classique
  const invoicesFilteredByOsteoCabinet = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(inv => {
      const osteoOk = selectedOsteopathId == null || selectedOsteopathId === "ALL" || inv.osteopathId != null && Number(inv.osteopathId) === Number(selectedOsteopathId);
      const cabinetOk = selectedCabinetId == null || selectedCabinetId === "ALL" || inv.cabinetId != null && Number(inv.cabinetId) === Number(selectedCabinetId);
      return osteoOk && cabinetOk;
    });
  }, [invoices, selectedCabinetId, selectedOsteopathId]);
  const {
    filteredInvoices,
    groupInvoicesByYearAndMonth: groupedInvoices,
    generateYearOptions,
    generateMonthOptions
  } = useInvoiceFiltering(invoicesFilteredByOsteoCabinet, searchQuery, statusFilter, patientDataMap);

  // Available month options for the selected year
  const monthOptions = generateMonthOptions(selectedYear, filteredInvoices);
  const yearOptions = generateYearOptions();

  // Fetch patient and osteopath data for all invoices
  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!invoices || invoices.length === 0) return;
      
      // Fetch patient data
      const patientIds = [...new Set(invoices.map(invoice => invoice.patientId))];
      const patientMap = new Map<number, Patient>();
      for (const patientId of patientIds) {
        try {
          const patient = await api.getPatientById(patientId);
          if (patient) {
            patientMap.set(patientId, patient);
          }
        } catch (error) {
          console.error(`Error fetching patient ${patientId}:`, error);
        }
      }
      setPatientDataMap(patientMap);

      // Fetch osteopath data
      const osteopathIds = [...new Set(invoices.map(invoice => invoice.osteopathId).filter(Boolean))];
      const osteopathMap = new Map<number, Osteopath>();
      for (const osteopathId of osteopathIds) {
        try {
          const osteopath = await api.getOsteopathById(osteopathId!);
          if (osteopath) {
            osteopathMap.set(osteopathId!, osteopath);
          }
        } catch (error) {
          console.error(`Error fetching osteopath ${osteopathId}:`, error);
        }
      }
      setOsteopathDataMap(osteopathMap);
    };
    fetchRelatedData();
  }, [invoices]);

  // Function to load invoice-related data (patient, osteopath, cabinet)
  const loadInvoiceRelatedData = async (invoice: Invoice) => {
    try {
      // Load patient data
      let patientData = null;
      let osteopathData = null;
      let cabinetData = null;
      if (invoice.patientId) {
        patientData = await api.getPatientById(invoice.patientId);

        // Get osteopath ID from patient or logged-in user
        const osteopathId = patientData?.osteopathId || user?.osteopathId;
        if (osteopathId) {
          osteopathData = await api.getOsteopathById(osteopathId);
          if (osteopathData?.id) {
            const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
            if (cabinets && cabinets.length > 0) {
              cabinetData = cabinets[0];
            }
          }
        }
      }
      return {
        patient: patientData,
        osteopath: osteopathData,
        cabinet: cabinetData
      };
    } catch (error) {
      console.error("Error loading related data:", error);
      return {
        patient: null,
        osteopath: null,
        cabinet: null
      };
    }
  };

  // Delete invoice handler
  const handleDeleteInvoice = async () => {
    if (!selectedInvoiceId) return;
    try {
      await api.deleteInvoice(selectedInvoiceId);
      toast.success("Facture supprimée avec succès");
      refetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Erreur lors de la suppression de la facture");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  // Print and download handlers
  const handlePrintInvoice = async (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setPrintAllInvoices(null);

    // Load related data
    const relatedData = await loadInvoiceRelatedData(invoice);
    setPrintPatient(relatedData.patient);
    setPrintOsteopath(relatedData.osteopath);
    setPrintCabinet(relatedData.cabinet);
  };
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Load related data before printing
      const relatedData = await loadInvoiceRelatedData(invoice);
      setIsPreparingPrint(true);
      setPrintInvoice(invoice);
      setPrintPatient(relatedData.patient);
      setPrintOsteopath(relatedData.osteopath);
      setPrintCabinet(relatedData.cabinet);
      setPrintAllInvoices(null);
      setReadyToPrint(true);
    } catch (error) {
      console.error("Erreur lors de la préparation de l'impression:", error);
      toast.error("Erreur lors de la préparation du PDF");
      setIsPreparingPrint(false);
    }
  };
  const handleDownloadAllInvoices = async () => {
    try {
      const yearInvoices = filteredInvoices.filter(invoice => {
        const date = new Date(invoice.date);
        return date.getFullYear().toString() === selectedYear;
      });
      if (yearInvoices.length === 0) {
        toast.error(`Aucune facture trouvée pour l'année ${selectedYear}`);
        return;
      }

      setIsPreparingPrint(true);
      // For multiple invoices, use the first one's data
      if (yearInvoices.length > 0) {
        const relatedData = await loadInvoiceRelatedData(yearInvoices[0]);
        setPrintPatient(null);
        setPrintOsteopath(relatedData.osteopath);
        setPrintCabinet(relatedData.cabinet);
      }
      setPrintAllInvoices(yearInvoices);
      setPrintInvoice(null);
      setReadyToPrint(true);
      toast.info(`Préparation du téléchargement des ${yearInvoices.length} factures de ${selectedYear}...`);
    } catch (error) {
      console.error("Erreur lors de la préparation des exports:", error);
      toast.error("Erreur lors de la préparation des exports PDF");
      setIsPreparingPrint(false);
    }
  };
  const handleDownloadMonthInvoices = async (year: string, monthKey: string) => {
    if (!invoices) return;
    const monthInvoices = filteredInvoices.filter(invoice => {
      const date = new Date(invoice.date);
      const invoiceMonthKey = format(date, "yyyy-MM");
      return invoiceMonthKey === monthKey;
    });
    if (monthInvoices.length === 0) {
      const monthLabel = format(parseISO(`${monthKey}-01`), "MMMM yyyy", {
        locale: fr
      });
      toast.error(`Aucune facture trouvée pour ${monthLabel}`);
      return;
    }

    // For multiple invoices, use the first one's data
    if (monthInvoices.length > 0) {
      const relatedData = await loadInvoiceRelatedData(monthInvoices[0]);
      setPrintPatient(null);
      setPrintOsteopath(relatedData.osteopath);
      setPrintCabinet(relatedData.cabinet);
    }
    setPrintAllInvoices(monthInvoices);
    setPrintInvoice(null);
    const monthLabel = format(parseISO(`${monthKey}-01`), "MMMM yyyy", {
      locale: fr
    });
    toast.info(`Préparation du téléchargement des ${monthInvoices.length} factures de ${monthLabel}...`);
  };

  // Handler for print completion
  const handlePrintComplete = () => {
    setPrintInvoice(null);
    setPrintAllInvoices(null);
    setPrintPatient(null);
    setPrintOsteopath(null);
    setPrintCabinet(null);
    setReadyToPrint(false);
    setIsPreparingPrint(false);
  };

  // Handler for edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}/edit`);
  };

  // -- Ajout : composants Selects pour filtrage au-dessus du Card Filters --
  return <>
      {isPreparingPrint && <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-50">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Préparation du PDF en cours...
          </p>
        </div>}
      <Layout>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* FILTRES OSTEOPATHE / CABINET */}
        

        <div className="mb-6 mt-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <span className="text-black dark:text-gray-100 font-semibold">
                Notes d'honoraires
              </span>
            </h1>
            <Button onClick={() => navigate("/invoices/new")} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 hover:text-white text-gray-300">
              <Plus className="h-5 w-5" />
              Créer une note d'honoraire
            </Button>
          </div>

          {/* Alerte HDS */}
          <div className="mb-4">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Données de facturation sensibles (locales)
              </AlertTitle>
              <AlertDescription>
                Les détails patients et factures restent stockés sur votre appareil. Partage via export sécurisé.
              </AlertDescription>
            </Alert>
          </div>

          {/* Filters avec toutes les props nécessaires */}
          <InvoiceFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} selectedYear={selectedYear} setSelectedYear={setSelectedYear} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} onDownloadAll={handleDownloadAllInvoices} invoiceYears={yearOptions} monthOptions={monthOptions} invoices={invoices || []} patientDataMap={patientDataMap} osteopath={osteopath} selectedCabinetId={selectedCabinetId} setSelectedCabinetId={setSelectedCabinetId} selectedOsteopathId={selectedOsteopathId} setSelectedOsteopathId={setSelectedOsteopathId} cabinets={cabinets} osteopaths={osteopaths} osteopathDataMap={osteopathDataMap} />
          {/* Content */}
          {invoicesLoading ? <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div> : filteredInvoices && filteredInvoices.length > 0 ? <div className="space-y-6">
              {/* Invoices by year/month */}
              {Object.entries(groupedInvoices).sort((a, b) => b[0].localeCompare(a[0])).map(([year, months]) => {
            // Filter by selected year
            if (year !== selectedYear) return null;
            return <Accordion type="multiple" className="space-y-4" key={year}>
                      <InvoiceYearGroup 
                        year={year} 
                        months={months} 
                        selectedMonth={selectedMonth} 
                        patientDataMap={patientDataMap} 
                        osteopathDataMap={osteopathDataMap}
                        onDeleteInvoice={id => {
                          setSelectedInvoiceId(id);
                          setIsDeleteModalOpen(true);
                        }} 
                        onPrintInvoice={handlePrintInvoice} 
                        onDownloadInvoice={handleDownloadInvoice} 
                        onDownloadMonthInvoices={handleDownloadMonthInvoices}
                        onEditInvoice={handleEditInvoice}
                      />
                    </Accordion>;
          })}
            </div> : <InvoiceEmptyState hasFilters={searchQuery !== "" || statusFilter !== "ALL" || selectedMonth !== null} />}
        </div>
        {/* Print / Modal etc */}
        <InvoicePrintWrapper printInvoice={printInvoice} printAllInvoices={printAllInvoices} printPatient={printPatient} printOsteopath={printOsteopath} printCabinet={printCabinet} patientDataMap={patientDataMap} selectedYear={selectedYear} selectedMonth={selectedMonth} onPrintComplete={handlePrintComplete} isPreparingPrint={isPreparingPrint} setReadyToPrint={setReadyToPrint} readyToPrint={readyToPrint} />

        {/* Delete confirmation modal */}
        {isDeleteModalOpen && selectedInvoiceId && <ConfirmDeleteInvoiceModal isOpen={isDeleteModalOpen} invoiceNumber={selectedInvoiceId.toString().padStart(4, "0")} onCancel={() => setIsDeleteModalOpen(false)} onDelete={handleDeleteInvoice} />}
      </Layout>
    </>;
};
export default InvoicesPage;