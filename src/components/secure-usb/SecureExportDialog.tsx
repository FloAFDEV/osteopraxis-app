import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { PatientCombobox } from "@/components/patients/PatientCombobox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, Lock, Shield, Users, Calendar, FileText, AlertTriangle } from "lucide-react";
import { usbExportService, type ExportOptions } from "@/services/secure-usb-sharing/usb-export-service";
import { toast } from "sonner";

interface SecureExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecureExportDialog = ({ open, onOpenChange }: SecureExportDialogProps) => {
  const [step, setStep] = useState<'options' | 'progress' | 'complete'>('options');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    password: '',
    includePatients: true,
    includeAppointments: true,
    includeInvoices: false,
    patientIds: [],
    dateRange: undefined
  });
  const [progress, setProgress] = useState(0);
  const [exportedFile, setExportedFile] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleExport = async () => {
    // Valider les options
    const validationErrors = usbExportService.validateExportOptions(exportOptions);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setStep('progress');
    setProgress(0);

    try {
      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Effectuer l'export
      const blob = await usbExportService.exportSecureData(exportOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      setExportedFile(blob);
      setStep('complete');

      toast.success("Export sécurisé créé avec succès");
    } catch (error) {
      console.error('Export failed:', error);
      setErrors([error instanceof Error ? error.message : 'Erreur lors de l\'export']);
      setStep('options');
      toast.error("Échec de l'export");
    }
  };

  const handleDownload = () => {
    if (!exportedFile) return;

    const url = URL.createObjectURL(exportedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = usbExportService.generateFileName();
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Fichier téléchargé - vous pouvez maintenant le copier sur votre clé USB");
  };

  const handleClose = () => {
    setStep('options');
    setProgress(0);
    setExportedFile(null);
    setErrors([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Export sécurisé pour clé USB
          </DialogTitle>
        </DialogHeader>

        {step === 'options' && (
          <div className="space-y-6">
            {/* Security Warning */}
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Partage sécurisé :</strong> Vos données seront chiffrées avec AES-256 
                avant d'être exportées. Le fichier généré pourra être déchiffré uniquement 
                avec le mot de passe que vous définissez.
              </AlertDescription>
            </Alert>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe de chiffrement *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={exportOptions.password}
                onChange={(e) => setExportOptions(prev => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Ce mot de passe sera nécessaire pour déchiffrer le fichier
              </p>
            </div>

            {/* Types de données */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Types de données à exporter</Label>
              
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="patients"
                      checked={exportOptions.includePatients}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includePatients: !!checked }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="patients">Patients et données médicales</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="appointments"
                      checked={exportOptions.includeAppointments}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeAppointments: !!checked }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <Label htmlFor="appointments">Rendez-vous</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="invoices"
                      checked={exportOptions.includeInvoices}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeInvoices: !!checked }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <Label htmlFor="invoices">Factures</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtres optionnels */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Filtres (optionnel)</Label>
              
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Patients spécifiques (optionnel)</Label>
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour exporter tous les patients
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de début</Label>
                      <DateInput
                        value={exportOptions.dateRange?.start}
                        onChange={(date) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            dateRange: date ? { 
                              start: date, 
                              end: prev.dateRange?.end || new Date() 
                            } : undefined 
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de fin</Label>
                      <DateInput
                        value={exportOptions.dateRange?.end}
                        onChange={(date) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            dateRange: prev.dateRange?.start && date ? { 
                              start: prev.dateRange.start, 
                              end: date 
                            } : undefined 
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Erreurs */}
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

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Créer l'export sécurisé
              </Button>
            </div>
          </div>
        )}

        {step === 'progress' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Shield className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-medium">Chiffrement en cours...</h3>
              <p className="text-muted-foreground">
                Vos données sont en cours de chiffrement avec AES-256
              </p>
            </div>

            <Progress value={progress} className="w-full" />

            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Sécurisé</Badge>
              <Badge variant="secondary">Chiffré</Badge>
              <Badge variant="secondary">RGPD Compliant</Badge>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-600">Export créé avec succès !</h3>
              <p className="text-muted-foreground">
                Votre fichier sécurisé est prêt à être téléchargé
              </p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>Données chiffrées avec AES-256</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Intégrité vérifiée par checksum</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>Extension .phub (PatientHub sécurisé)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button onClick={handleDownload} className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger le fichier sécurisé
              </Button>
              <p className="text-xs text-muted-foreground">
                Copiez ce fichier sur votre clé USB pour le partager en toute sécurité
              </p>
            </div>

            <Button variant="outline" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};