
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Patient } from "@/types";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onAppointmentCreated?: () => void;
}

export function NewAppointmentModal({
  open,
  onOpenChange,
  patient,
  onAppointmentCreated
}: NewAppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !reason) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      const appointmentDateTime = new Date(`${date}T${time}`);
      
      const appointmentData = {
        date: appointmentDateTime.toISOString(),
        patientId: patient.id,
        reason,
        start: time,
        end: format(new Date(appointmentDateTime.getTime() + 60 * 60 * 1000), "HH:mm"),
        status: "SCHEDULED" as const,
        notes: notes || null,
        cabinetId: patient.cabinetId || 1,
        notificationSent: false
      };

      await api.createAppointment(appointmentData);
      
      toast.success(
        `Rendez-vous créé pour ${patient.firstName} ${patient.lastName} le ${format(appointmentDateTime, "PPP 'à' HH:mm", { locale: fr })}`
      );

      // Reset form
      setDate("");
      setTime("");
      setReason("");
      setNotes("");
      
      // Close modal
      onOpenChange(false);
      
      // Notify parent component to refresh data
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }

    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      toast.error(
        error instanceof Error 
          ? `Erreur: ${error.message}` 
          : "Impossible de créer le rendez-vous"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Nouveau rendez-vous
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {patient.firstName} {patient.lastName}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">
                Heure *
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Motif de consultation *
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Douleurs lombaires, suivi..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes complémentaires..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Information</p>
                <p>Le rendez-vous sera créé avec une durée d'1 heure par défaut.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? "Création..." : "Créer le rendez-vous"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
