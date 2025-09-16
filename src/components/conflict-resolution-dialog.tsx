
import React, { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { AppointmentConflictInfo, AppointmentData } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ChevronRight } from "lucide-react";
import { format, addMinutes, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictInfo: AppointmentConflictInfo;
  requestedDate: string;
  onSelectAlternative: (newDate: string) => void;
  onForceUpdate: () => void;
  onCancel: () => void;
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  conflictInfo,
  requestedDate,
  onSelectAlternative,
  onForceUpdate,
  onCancel
}: ConflictResolutionDialogProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && requestedDate) {
      generateAlternativeSlots();
    }
  }, [open, requestedDate]);

  const generateAlternativeSlots = () => {
    setLoading(true);
    
    // Simuler la génération de créneaux alternatifs
    const baseDate = parseISO(requestedDate);
    const slots: TimeSlot[] = [];
    
    // Générer des créneaux avant et après l'heure demandée
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue; // Skip the conflicting slot
      
      const slotTime = addMinutes(baseDate, i * 60);
      const timeString = format(slotTime, "HH:mm");
      
      // Simulation: certains créneaux sont disponibles
      const isAvailable = Math.random() > 0.3;
      
      slots.push({
        time: slotTime.toISOString(),
        available: isAvailable,
        reason: isAvailable ? undefined : "Créneau occupé"
      });
    }
    
    setAvailableSlots(slots);
    setLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "PPP 'à' HH:mm", { locale: fr });
  };

  const handleAlternativeSelect = (slotTime: string) => {
    onSelectAlternative(slotTime);
    onOpenChange(false);
  };

  if (!conflictInfo) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Clock className="h-5 w-5" />
            Conflit de rendez-vous détecté
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                Un rendez-vous existe déjà le {formatDateTime(requestedDate)}
              </p>
              
              {conflictInfo.conflictingAppointments?.map((appointment: AppointmentData) => (
                <div key={appointment.id} className="bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <span className="font-medium text-foreground">{appointment.patientName}</span>
                    </div>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4" />
                Créneaux alternatifs suggérés
              </h4>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-2">
                  {availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 rounded border transition-colors",
                        slot.available 
                          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50 cursor-pointer" 
                          : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60"
                      )}
                      onClick={() => slot.available && handleAlternativeSelect(slot.time)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{formatDateTime(slot.time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {slot.available ? (
                          <>
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              Disponible
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            {slot.reason}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel}>
            Annuler
          </AlertDialogCancel>
          <Button variant="outline" onClick={generateAlternativeSlots}>
            Actualiser les créneaux
          </Button>
          <Button variant="destructive" onClick={onForceUpdate}>
            Forcer la modification
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
