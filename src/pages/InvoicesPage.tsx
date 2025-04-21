import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { Invoice } from "@/types";
import { toast } from "sonner";
import { FileText, Search, Plus, Activity, Filter, Printer, Download, Calendar } from "lucide-react";
import { InvoiceDetails } from "@/components/invoice-details";
import ConfirmDeleteInvoiceModal from "@/components/modals/ConfirmDeleteInvoiceModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { InvoicePrintView } from "@/components/invoice-print-view";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";


const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [printAllInvoices, setPrintAllInvoices] = useState<Invoice[] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [readyToPrint, setReadyToPrint] = useState(false);

  // Configuration de react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printInvoice ? `Facture_${printInvoice.id.toString().padStart(4, "0")}` : 
                   printAllInvoices ? `Factures_${selectedYear}` : "Facture",
    onAfterPrint: () => {
      setPrintInvoice(null);
      setPrintAllInvoices(null);
      setReadyToPrint(false);
    },
  });

  // Effet pour déclencher l'impression lorsqu'une facture est sélectionnée
  useEffect(() => {
    if (printInvoice || printAllInvoices) {
      setReadyToPrint(true);
    }
  }, [printInvoice, printAllInvoices]);

  // Effet pour déclencher l'impression lorsque tout est prêt
  useEffect(() => {
    if ((printInvoice || printAllInvoices) && readyToPrint) {
      setTimeout(() => {
        handlePrint && handlePrint();
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToPrint]);

  const {
    data: invoices,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: api.getInvoices
  });

  const handleDeleteInvoice = async () => {
    if (!selectedInvoiceId) return;
    try {
      await api.deleteInvoice(selectedInvoiceId);
      toast.success("Facture supprimée avec succès");
      refetch();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  // Nouvelle : Trouver le nom du patient dans les data Invoice (pas de Patient? fallback)
  const getPatientName = (invoice: Invoice) => {
    // @ts-ignore (Patient peut être attaché par API)
    if (invoice.Patient) {
      //@ts-ignore
      return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
    }
    return `Patient #${invoice.patientId}`;
  };

  // Filtrer les factures selon les critères de recherche et de statut
  const filteredInvoices = invoices ? invoices.filter(invoice => {
    // Tenir compte de la possibilité que Patient soit undefined
    // @ts-ignore
    const patientFirstName = invoice.Patient?.firstName || "";
    // @ts-ignore
    const patientLastName = invoice.Patient?.lastName || "";

    const matchesQuery =
      patientFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toString().includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || invoice.paymentStatus === statusFilter;
    return matchesQuery && matchesStatus;
  }) : [];

  // Filtrer les factures par année
  const getInvoicesByYear = (year: string): Invoice[] => {
    if (!invoices) return [];
    
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate.getFullYear().toString() === year;
    });
  };

  // Générer les options des années pour le sélecteur
  const generateYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    // Générer les 5 dernières années
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    
    return years;
  };

  // Impression et téléchargement d'une facture individuelle
  const handlePrintInvoice = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setPrintAllInvoices(null);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setPrintAllInvoices(null);
    toast.info("Utilisez la fenêtre d'impression pour sauvegarder le PDF.");
  };

  // Impression et téléchargement de toutes les factures d'une année
  const handleDownloadAllInvoices = () => {
    const yearInvoices = getInvoicesByYear(selectedYear);
    
    if (yearInvoices.length === 0) {
      toast.error(`Aucune facture trouvée pour l'année ${selectedYear}`);
      return;
    }
    
    setPrintAllInvoices(yearInvoices);
    setPrintInvoice(null);
    toast.info(`Préparation du téléchargement des ${yearInvoices.length} factures de ${selectedYear}...`);
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-500 dark:via-purple-500 dark:to-purple-500">
              Factures
            </span>
          </h1>
          <Button onClick={() => navigate("/invoices/new")} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600">
            <Plus className="h-5 w-5" />
            Nouvelle facture
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher une facture..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="PAID">Payée</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CANCELED">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nouvelle section pour le téléchargement par année */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                Export annuel:
              </div>
              <div className="flex gap-3 items-center">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYearOptions().map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleDownloadAllInvoices}
                  variant="outline" 
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-800/30 dark:text-amber-300 dark:border-amber-700/50"
                >
                  <Download className="h-4 w-4" />
                  Télécharger les factures
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredInvoices && filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map(invoice => (
              <div key={invoice.id} className="relative group">
                <InvoiceDetails
                  invoice={invoice}
                  patientName={getPatientName(invoice)}
                  onEdit={() => navigate(`/invoices/${invoice.id}`)}
                  onDelete={() => {
                    setSelectedInvoiceId(invoice.id);
                    setIsDeleteModalOpen(true);
                  }}
                  onDownload={() => handleDownloadInvoice(invoice)}
                  onPrint={() => handlePrintInvoice(invoice)}
                />
                <div className="absolute top-3 right-4 flex gap-1 opacity-70 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePrintInvoice(invoice)}
                    title="Imprimer"
                  >
                    <Printer />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadInvoice(invoice)}
                    title="Télécharger"
                  >
                    <Download />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto text-amber-300 dark:text-amber-600" />
            <h3 className="mt-4 text-xl font-medium">Aucune facture trouvée</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== "ALL"
                ? "Essayez de modifier vos critères de recherche."
                : "Commencez par créer votre première facture."}
            </p>
            <Button onClick={() => navigate("/invoices/new")} className="mt-6 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Créer une facture
            </Button>
          </div>
        )}
      </div>

      {/* Impression PDF/print invisible pour la facture unique sélectionnée */}
      {printInvoice && (
        <div className="hidden">
          <div ref={printRef}>
            <InvoicePrintView invoice={printInvoice} />
          </div>
        </div>
      )}

      {/* Impression PDF/print invisible pour toutes les factures d'une année */}
      {printAllInvoices && (
        <div className="hidden">
          <div ref={printRef}>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-center mb-8">
                Factures de l'année {selectedYear}
              </h1>
              <div className="space-y-8">
                {printAllInvoices.map(invoice => (
                  <div key={invoice.id} className="page-break-after">
                    <InvoicePrintView invoice={invoice} />
                    <div className="h-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedInvoiceId && (
        <ConfirmDeleteInvoiceModal
          isOpen={isDeleteModalOpen}
          invoiceNumber={selectedInvoiceId.toString().padStart(4, "0")}
          onCancel={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteInvoice}
        />
      )}
    </Layout>
  );
};

export default InvoicesPage;
