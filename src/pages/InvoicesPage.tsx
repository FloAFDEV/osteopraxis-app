
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Invoice, PaymentStatus } from "@/types";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Edit, FileText, Plus, Search, Trash } from "lucide-react";
import { ConfirmDeleteInvoiceModal } from "@/components/modals/ConfirmDeleteInvoiceModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface SortState {
  column: keyof Invoice | "";
  direction: "asc" | "desc";
}

interface FilterForm {
  status: string;
  year: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [sortState, setSortState] = useState<SortState>({
    column: "date",
    direction: "desc", // Default to newest first
  });
  const [years, setYears] = useState<string[]>([]);

  const navigate = useNavigate();

  const form = useForm<FilterForm>({
    defaultValues: {
      status: "all",
      year: "all"
    }
  });

  const watchStatus = form.watch("status");
  const watchYear = form.watch("year");

  // Get all invoices
  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const data = await api.getInvoices();
        setInvoices(data);

        // Extract all unique years from invoices for filter
        const uniqueYears = Array.from(
          new Set(
            data.map((invoice) => new Date(invoice.date).getFullYear().toString())
          )
        ).sort((a, b) => parseInt(b) - parseInt(a));
        setYears(uniqueYears);
      } catch (error) {
        console.error("Failed to fetch notes d'honoraire:", error);
        toast.error("Erreur lors du chargement des notes d'honoraire");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  // Apply filtering
  useEffect(() => {
    let result = [...invoices];
    
    // Text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((invoice) => {
        const invoiceId = invoice.id.toString();
        const amount = invoice.amount.toString();
        return invoiceId.includes(query) || amount.includes(query);
      });
    }

    // Status filter
    if (watchStatus !== "all") {
      result = result.filter(invoice => invoice.paymentStatus === watchStatus);
    }

    // Year filter
    if (watchYear !== "all") {
      result = result.filter(invoice => {
        const invoiceYear = new Date(invoice.date).getFullYear().toString();
        return invoiceYear === watchYear;
      });
    }

    // Apply sorting
    if (sortState.column) {
      result = [...result].sort((a, b) => {
        if (sortState.column === "date") {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortState.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (sortState.column === "id") {
          return sortState.direction === "asc" 
            ? a.id - b.id 
            : b.id - a.id;
        }
        if (sortState.column === "amount") {
          return sortState.direction === "asc" 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        }
        return 0;
      });
    }

    setFilteredInvoices(result);
  }, [invoices, searchQuery, sortState, watchStatus, watchYear]);

  const handleSort = (column: keyof Invoice) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Confirm delete
  const confirmDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  // Delete invoice
  const handleDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await api.deleteInvoice(invoiceToDelete.id);
      setInvoices(prevInvoices => prevInvoices.filter(i => i.id !== invoiceToDelete.id));
      toast.success("Note d'honoraire supprimée avec succès");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete note d'honoraire:", error);
      toast.error("Erreur lors de la suppression de la note d'honoraire");
    }
  };

  const renderSortIcon = (column: keyof Invoice) => {
    if (sortState.column !== column) return null;
    return sortState.direction === "asc" ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />;
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500 hover:bg-green-600">Payée</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En attente</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-500 hover:bg-red-600">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-500" />
            Notes d'honoraire
          </h1>
          <Button onClick={() => navigate("/invoices/new")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Nouvelle note
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une note..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Form {...form}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="PAID">Payées</SelectItem>
                              <SelectItem value="PENDING">En attente</SelectItem>
                              <SelectItem value="CANCELED">Annulées</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filtrer par année" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Toutes les années</SelectItem>
                              {years.map(year => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Form>

              <div className="text-right text-sm text-muted-foreground pt-2">
                {filteredInvoices.length} note(s) trouvée(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-[100px] cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      N° {renderSortIcon("id")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date {renderSortIcon("date")}
                    </TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      Montant {renderSortIcon("amount")}
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                          <p className="text-sm text-muted-foreground">Chargement des notes d'honoraire...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <p className="text-muted-foreground">Aucune note d'honoraire trouvée</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigate("/invoices/new")}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Créer une note
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.id.toString().padStart(4, '0')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {invoice.Patient ? (
                            `${invoice.Patient.firstName} ${invoice.Patient.lastName}`
                          ) : (
                            <span className="text-muted-foreground">Patient inconnu</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.amount.toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => confirmDelete(invoice)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteInvoiceModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        invoice={invoiceToDelete}
      />
    </Layout>
  );
}
