import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Lock, Shield, CheckCircle, AlertTriangle, Users, Calendar, FileText, AlertCircle } from "lucide-react";
import { usbImportService, type ImportOptions, type ImportResult, type ImportConflict, usbValidationService } from "@/services/secure-usb-sharing";
import { toast } from "sonner";

interface SecureImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecureImportDialog = ({ open, onOpenChange }: SecureImportDialogProps) => {
  const [step, setStep] = useState<'upload' | 'options' | 'progress' | 'conflicts' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    password: '',
    conflictResolution: 'skip',
    validateIntegrity: true
  });
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<ImportConflict[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du fichier
      const validationReport = await usbValidationService.validateSecureFile(file);
      
      if (!validationReport.isValid) {
        const errorMessages = validationReport.issues
          .filter(i => i.type === 'error')
          .map(i => i.message);
        setErrors(errorMessages);
        return;
      }

      setSelectedFile(file);
      setErrors([]);
      setStep('options');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    if (!importOptions.password) {
      setErrors(['Le mot de passe est requis']);
      return;
    }

    setErrors([]);
    setStep('progress');
    setProgress(0);

    try {
      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Effectuer l'import
      const result = await usbImportService.importSecureData(selectedFile, importOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      setImportResult(result);

      if (result.conflicts.length > 0 && importOptions.conflictResolution === 'merge') {
        setPendingConflicts(result.conflicts);
        setStep('conflicts');
      } else {
        setStep('complete');
      }

      if (result.success) {
        toast.success("Import sécurisé terminé avec succès");
      } else {
        toast.error("Import terminé avec des erreurs");
      }
    } catch (error) {
      console.error('Import failed:', error);
      setErrors([error instanceof Error ? error.message : 'Erreur lors de l\'import']);
      setStep('options');
      toast.error("Échec de l'import");
    }
  };

  const handleConflictResolution = async () => {
    // TODO: Implémenter la résolution manuelle des conflits
    setStep('complete');
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setProgress(0);
    setImportResult(null);
    setPendingConflicts([]);
    setErrors([]);
    onOpenChange(false);
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'patient': return <Users className="h-4 w-4 text-blue-500" />;
      case 'appointment': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'invoice': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import sécurisé depuis clé USB
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Import sécurisé :</strong> Sélectionnez un fichier .phub créé avec PatientHub 
                pour importer des données chiffrées en toute sécurité.
              </AlertDescription>
            </Alert>

            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sélectionner un fichier sécurisé</h3>
                    <p className="text-sm text-muted-foreground">
                      Fichiers .phub uniquement (max 50MB)
                    </p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Parcourir les fichiers
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".phub"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </CardContent>
            </Card>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'options' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Fichier sélectionné
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedFile?.name}</span>
                  <Badge variant="secondary">Chiffré</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe de déchiffrement *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Saisissez le mot de passe"
                value={importOptions.password}
                onChange={(e) => setImportOptions(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Gestion des conflits</Label>
              <RadioGroup
                value={importOptions.conflictResolution}
                onValueChange={(value) => 
                  setImportOptions(prev => ({ ...prev, conflictResolution: value as any }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="skip" />
                  <Label htmlFor="skip" className="text-sm">
                    Ignorer les doublons (recommandé)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwrite" id="overwrite" />
                  <Label htmlFor="overwrite" className="text-sm">
                    Remplacer les données existantes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="merge" id="merge" />
                  <Label htmlFor="merge" className="text-sm">
                    Demander pour chaque conflit (vous choisirez au cas par cas)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Astuce: "Ignorer" garde vos données actuelles, "Remplacer" écrase les doublons, "Demander" vous sollicite pour chaque conflit.
              </p>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
              <Button onClick={handleImport} className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Déchiffrer et importer
              </Button>
            </div>
          </div>
        )}

        {step === 'progress' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Shield className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-medium">Déchiffrement en cours...</h3>
              <p className="text-muted-foreground">
                Vos données sont en cours de déchiffrement et d'import
              </p>
            </div>

            <Progress value={progress} className="w-full" />

            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Déchiffrement</Badge>
              <Badge variant="secondary">Validation</Badge>
              <Badge variant="secondary">Import</Badge>
            </div>
          </div>
        )}

        {step === 'conflicts' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto" />
              <h3 className="text-lg font-medium">Conflits détectés</h3>
              <p className="text-muted-foreground">
                {pendingConflicts.length} éléments en conflit nécessitent votre attention
              </p>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto">
              {pendingConflicts.map((conflict, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {getConflictIcon(conflict.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{conflict.type}</Badge>
                          <span className="text-sm font-medium">ID: {conflict.existingId}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{conflict.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Ignorer</Button>
                        <Button size="sm" variant="destructive">Remplacer</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('complete')}>
                Ignorer tous
              </Button>
              <Button onClick={handleConflictResolution}>
                Appliquer les résolutions
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && importResult && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                importResult.success ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {importResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <h3 className={`text-lg font-medium ${
                importResult.success ? 'text-green-600' : 'text-orange-600'
              }`}>
                Import {importResult.success ? 'terminé' : 'terminé avec erreurs'}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{importResult.imported.patients}</div>
                  <div className="text-sm text-muted-foreground">Patients importés</div>
                  {importResult.skipped.patients > 0 && (
                    <div className="text-xs text-orange-500 mt-1">
                      {importResult.skipped.patients} ignorés
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{importResult.imported.appointments}</div>
                  <div className="text-sm text-muted-foreground">Rendez-vous importés</div>
                  {importResult.skipped.appointments > 0 && (
                    <div className="text-xs text-orange-500 mt-1">
                      {importResult.skipped.appointments} ignorés
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{importResult.imported.invoices}</div>
                  <div className="text-sm text-muted-foreground">Factures importées</div>
                  {importResult.skipped.invoices > 0 && (
                    <div className="text-xs text-orange-500 mt-1">
                      {importResult.skipped.invoices} ignorées
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erreurs rencontrées :</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li className="text-sm">... et {importResult.errors.length - 5} autres erreurs</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};