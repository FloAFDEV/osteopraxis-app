import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointment-form";
import { Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";

interface AppointmentModalProps {
  patients: Patient[];
  selectedDate?: Date;
  triggerButton?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AppointmentModal({
  patients,
  selectedDate,
  triggerButton,
  isOpen,
  onOpenChange,
  onSuccess,
}: AppointmentModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Nouveau rendez-vous
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nouveau rendez-vous
            {selectedDate && (
              <span className="text-muted-foreground font-normal ml-2">
                - {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AppointmentForm
            patients={patients}
            defaultValues={{
              date: selectedDate || new Date(),
              time: "09:00",
              reason: "",
              notes: "",
              status: "SCHEDULED",
            }}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}