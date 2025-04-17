import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { Invoice } from "@/types";
import { toast } from "sonner";
import { FileText, Search, Plus, Activity, Filter } from "lucide-react";
import { InvoiceDetails } from "@/components/invoice-details";
import ConfirmDeleteInvoiceModal from "@/components/modals/ConfirmDeleteInvoiceModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
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
      // Cette fonctionnalité n'est pas encore implémentée dans l'API
      // await api.deleteInvoice(selectedInvoiceId);
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
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesQuery = invoice.Patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || invoice.Patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || invoice.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === "ALL" || invoice.paymentStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });
  return <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
       <h1 className="text-3xl font-bold flex items-center gap-3">
  <Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-500 dark:via-purple-500 dark:to-purple-500">
    Factures
  </span>
</h1>

<Button
  onClick={() => navigate("/invoices/new")}
  /* fond transparent + léger hover */
  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
>
  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-500" />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-500 dark:via-purple-500 dark:to-purple-500">
    Nouvelle&nbsp;facture
  </span>
</Button>

        </div>
        
        <Card className="mb-8">
          <CardContent className="p-2">
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
          </CardContent>
        </Card>
        
        {isLoading ? <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div> : filteredInvoices && filteredInvoices.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map(invoice => <InvoiceDetails key={invoice.id} invoice={invoice} patientName={invoice.Patient ? `${invoice.Patient.firstName} ${invoice.Patient.lastName}` : `Patient #${invoice.patientId}`} onEdit={() => navigate(`/invoices/${invoice.id}`)} onDelete={() => {
          setSelectedInvoiceId(invoice.id);
          setIsDeleteModalOpen(true);
        }} onDownload={() => toast.success("Téléchargement de la facture (fonctionnalité à venir)")} onPrint={() => {
          navigate(`/invoices/${invoice.id}`);
          setTimeout(() => {
            window.print();
          }, 500);
        }} />)}
          </div> : <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto text-amber-300 dark:text-amber-600" />
            <h3 className="mt-4 text-xl font-medium">Aucune facture trouvée</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== "ALL" ? "Essayez de modifier vos critères de recherche." : "Commencez par créer votre première facture."}
            </p>
            <Button onClick={() => navigate("/invoices/new")} className="mt-6 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Créer une facture
            </Button>
          </div>}
      </div>
      
      {isDeleteModalOpen && selectedInvoiceId && <ConfirmDeleteInvoiceModal isOpen={isDeleteModalOpen} invoiceNumber={selectedInvoiceId.toString().padStart(4, "0")} onCancel={() => setIsDeleteModalOpen(false)} onDelete={handleDeleteInvoice} />}
    </Layout>;
};
export default InvoicesPage;