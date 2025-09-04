
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Patient, CreateQuotePayload } from "@/types";
import { quoteService } from "@/services/quote-service";
import { api } from "@/services/api";
import { toast } from "sonner";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";

interface QuoteCreateFormProps {
  patient: Patient;
  onSuccess: (newQuote?: any) => void;
  onCancel: () => void;
}

export function QuoteCreateForm({ patient, onSuccess, onCancel }: QuoteCreateFormProps) {
  const [title, setTitle] = useState("Consultation d'ostéopathie");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [validUntil, setValidUntil] = useState<Date>(addDays(new Date(), 30));
  const [consultationDate, setConsultationDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  // États pour les informations légales
  const [osteopathInfo, setOsteopathInfo] = useState<any>(null);
  const [cabinetInfo, setCabinetInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [currentOsteopathId, setCurrentOsteopathId] = useState<number | null>(null);

  // Charger les informations de l'ostéopathe et du cabinet
  useEffect(() => {
    const loadLegalInfo = async () => {
      try {
        setLoadingInfo(true);
        
        // Récupérer l'ID de l'ostéopathe connecté
        const osteopathId = await getCurrentOsteopathId();
        setCurrentOsteopathId(osteopathId);
        
        // Charger les informations de l'ostéopathe
        if (osteopathId) {
          const osteopath = await api.getOsteopathById(osteopathId);
          setOsteopathInfo(osteopath);
        }
        
        // Charger les informations du cabinet
        if (patient.cabinetId) {
          const cabinet = await api.getCabinetById(Number(patient.cabinetId));
          setCabinetInfo(cabinet);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations légales:', error);
      } finally {
        setLoadingInfo(false);
      }
    };

    loadLegalInfo();
  }, [patient.cabinetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    if (!currentOsteopathId) {
      toast.error("Impossible de récupérer les informations de l'ostéopathe");
      return;
    }

    // Validation et conversion du montant en nombre
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }

    try {
      setLoading(true);
      
      const quoteData: CreateQuotePayload = {
        patientId: patient.id,
        osteopathId: currentOsteopathId,
        cabinetId: patient.cabinetId ? Number(patient.cabinetId) : null,
        title,
        description: description || null,
        amount: numericAmount,
        validUntil: format(validUntil, 'yyyy-MM-dd'),
        status: "DRAFT",
        notes: notes || null,
      };

      // ✅ Création devis sécurisée
      const newQuote = await quoteService.createQuote(quoteData);
      toast.success("Devis créé avec succès");
      onSuccess(newQuote);
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error("Erreur lors de la création du devis");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInfo) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des informations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nouveau devis pour {patient.firstName} {patient.lastName}</CardTitle>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations légales obligatoires */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Informations légales obligatoires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-blue-800 font-medium">Ostéopathe</Label>
                {osteopathInfo ? (
                  <div className="text-blue-700">
                    <p>{osteopathInfo.name}</p>
                    {cabinetInfo?.address && <p>{cabinetInfo.address}</p>}
                  </div>
                ) : (
                  <p className="text-blue-600 text-xs">Informations non disponibles</p>
                )}
              </div>
              <div>
                <Label className="text-blue-800 font-medium">Patient</Label>
                <div className="text-blue-700">
                  <p>{patient.firstName} {patient.lastName}</p>
                  <p>{patient.address || "Adresse non renseignée"}</p>
                </div>
              </div>
              <div>
                <Label className="text-blue-800 font-medium">Numéro RPPS/SIRET</Label>
                {osteopathInfo ? (
                  <div className="text-blue-700">
                    {osteopathInfo.rpps_number && <p>RPPS: {osteopathInfo.rpps_number}</p>}
                    {osteopathInfo.siret && <p>SIRET: {osteopathInfo.siret}</p>}
                    {!osteopathInfo.rpps_number && !osteopathInfo.siret && (
                      <p className="text-blue-600 text-xs">Numéro en cours d'attribution</p>
                    )}
                  </div>
                ) : (
                  <p className="text-blue-600 text-xs">Numéro en cours d'attribution</p>
                )}
              </div>
              <div>
                <Label className="text-blue-800 font-medium">TVA</Label>
                <p className="text-blue-700">TVA non applicable, article 261-4-1° du CGI</p>
              </div>
            </div>
            
            {/* Tampon/Signature */}
            {osteopathInfo?.stampUrl && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Label className="text-blue-800 font-medium">Tampon/Signature</Label>
                <div className="mt-2 flex items-center justify-center bg-white rounded p-2 border">
                  <img 
                    src={osteopathInfo.stampUrl} 
                    alt="Tampon/Signature professionnel" 
                    className="max-h-[80px] w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <p className="text-blue-600 text-xs mt-1">
                  Ce tampon/signature sera inclus dans le devis. 
                  Vous pouvez le modifier dans les paramètres du cabinet.
                </p>
              </div>
            )}
          </div>

          {/* Détails du devis */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Description de la prestation *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Consultation d'ostéopathie"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Montant total des honoraires (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date de la consultation</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !consultationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {consultationDate ? (
                        format(consultationDate, "dd MMMM yyyy", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={consultationDate}
                      onSelect={(date) => date && setConsultationDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Date de validité du devis</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !validUntil && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validUntil ? (
                        format(validUntil, "dd MMMM yyyy", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={(date) => date && setValidUntil(date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description détaillée (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description détaillée de la prestation..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes internes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes pour usage interne..."
                rows={2}
              />
            </div>
          </div>

          {/* Note importante */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Important :</strong> Le tampon et la signature sont récupérés depuis les paramètres du cabinet et seront automatiquement inclus dans le devis.
              {!osteopathInfo?.rpps_number && !osteopathInfo?.siret && (
                " Pensez à compléter les informations RPPS/SIRET dans les paramètres du cabinet."
              )}
              {!osteopathInfo?.stampUrl && (
                " Vous pouvez ajouter un tampon/signature dans les paramètres du cabinet pour qu'il apparaisse sur vos devis."
              )}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le devis"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
