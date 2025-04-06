
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { Invoice } from "@/types";
import { Loader2, Search, FileText, Printer, RefreshCw, Filter, EuroIcon, Inbox } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      return await api.getInvoices();
    },
  });
  
  const handleStatusChange = async (invoiceId: number, newStatus: 'PAID' | 'PENDING' | 'CANCELED') => {
    try {
      await api.updatePaymentStatus(invoiceId, newStatus);
      toast.success(`Statut mis à jour avec succès`);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };
  
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = searchQuery === "" ||
      (invoice.Patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.Patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      invoice.id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || invoice.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnue</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">Factures</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="whitespace-nowrap"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/invoices/new">
                    <FileText className="h-4 w-4 mr-2" />
                    Nouvelle facture
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par patient, numéro..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="w-[180px]">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut de paiement" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="PAID">Payées</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="CANCELED">Annulées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg">Chargement des factures...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-red-50 rounded-lg">
                <p className="text-red-600 mb-2">Erreur lors du chargement des factures.</p>
                <Button variant="outline" onClick={() => refetch()}>Réessayer</Button>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Inbox className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Aucune facture trouvée</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== "all" ? 
                    "Aucune facture ne correspond à vos critères de recherche." : 
                    "Commencez à créer des factures pour vos patients."}
                </p>
                <Button asChild>
                  <Link to="/invoices/new">
                    <FileText className="h-4 w-4 mr-2" />
                    Créer une facture
                  </Link>
                </Button>
              </div>
            ) : (
              <Table className="border rounded-md">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <TableCell className="font-medium">
                        #{invoice.id.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.date), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {invoice.Patient ? 
                          `${invoice.Patient.firstName} ${invoice.Patient.lastName}` : 
                          `Patient #${invoice.patientId}`}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/invoices/${invoice.id}/print`, '_blank')}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Select 
                            value={invoice.paymentStatus}
                            onValueChange={(value) => handleStatusChange(
                              invoice.id, 
                              value as 'PAID' | 'PENDING' | 'CANCELED'
                            )}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PAID">Payée</SelectItem>
                              <SelectItem value="PENDING">En attente</SelectItem>
                              <SelectItem value="CANCELED">Annulée</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InvoicesPage;
