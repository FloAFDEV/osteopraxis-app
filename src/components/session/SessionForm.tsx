
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionStatus } from "./SessionStatus";
import { MotifSection } from "./MotifSection";
import { CompteRenduSection } from "./CompteRenduSection";
import { Patient } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSessionAutoSave } from "@/hooks/use-session-auto-save";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export interface Session {
  id?: number;
  patientId: number;
  motif: string;
  compteRendu: string;
  status: "DRAFT" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  date: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
}

interface SessionFormProps {
  initialSession?: Session;
  patient: Patient;
  onSave?: (session: Session) => void;
  onCancel: () => void;
}

export function SessionForm({ 
  initialSession, 
  patient, 
  onSave,
  onCancel
}: SessionFormProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>(
    initialSession || {
      patientId: patient.id,
      motif: "",
      compteRendu: "",
      status: "IN_PROGRESS",
      date: new Date(),
      actualStartTime: new Date()
    }
  );

  // Local storage key for draft
  const draftKey = `session_draft_${patient.id}_${session.id || "new"}`;
  
  // Load draft from local storage on component mount
  const [savedDraft, setSavedDraft] = useLocalStorage<Session | null>(draftKey, null);
  
  // Auto-save functionality
  const { 
    save,
    isAutoSaving,
    lastSaved,
    startAutoSave,
    stopAutoSave
  } = useSessionAutoSave({
    data: session,
    onSave: (data) => setSavedDraft(data),
    interval: 30000, // 30 seconds
  });

  // Load draft on component mount
  useEffect(() => {
    if (savedDraft && !initialSession) {
      setSession(savedDraft);
      toast.info("Brouillon restauré");
    }
  }, [savedDraft, initialSession]);

  // Start auto-save when component mounts
  useEffect(() => {
    startAutoSave();
    
    // Handle beforeunload event to warn about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAutoSaving) {
        e.preventDefault();
        e.returnValue = "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter?";
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      stopAutoSave();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [startAutoSave, stopAutoSave, isAutoSaving]);

  // Update fields
  const updateField = useCallback((field: keyof Session, value: any) => {
    setSession(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((status: "DRAFT" | "PLANNED" | "IN_PROGRESS" | "COMPLETED") => {
    setSession(prev => {
      const newSession = { ...prev, status };
      
      // Add timestamps based on status
      if (status === "IN_PROGRESS" && !prev.actualStartTime) {
        newSession.actualStartTime = new Date();
      } else if (status === "COMPLETED" && !prev.actualEndTime) {
        newSession.actualEndTime = new Date();
      }
      
      return newSession;
    });
  }, []);

  // Save session
  const saveSession = useCallback(async () => {
    try {
      let result;
      
      // If we have an id, update, otherwise create
      if (session.id) {
        // Update existing session
        result = await api.updateSession(session);
        toast.success("Séance mise à jour");
      } else {
        // Create new session
        result = await api.createSession(session);
        setSession(prev => ({ ...prev, id: result.id }));
        toast.success("Séance créée");
      }
      
      // Update HDLM field on patient if session is completed
      if (session.status === "COMPLETED" && session.compteRendu) {
        await api.updatePatientHDLM(patient.id, session.compteRendu);
      }
      
      // Clear draft if saving completed successfully
      setSavedDraft(null);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(result);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to save session:", error);
      toast.error("Échec de la sauvegarde. Vos modifications sont conservées localement.");
      return null;
    }
  }, [session, patient.id, onSave, setSavedDraft]);

  // Complete session
  const completeSession = useCallback(async () => {
    const updatedSession = {
      ...session,
      status: "COMPLETED" as const,
      actualEndTime: new Date()
    };
    
    setSession(updatedSession);
    
    try {
      const result = await api.updateSession(updatedSession);
      
      // Update HDLM field on patient
      if (updatedSession.compteRendu) {
        await api.updatePatientHDLM(patient.id, updatedSession.compteRendu);
      }
      
      toast.success("Séance terminée");
      setSavedDraft(null);
      
      // Navigate to patient detail
      navigate(`/patients/${patient.id}`);
      
      return result;
    } catch (error) {
      console.error("Failed to complete session:", error);
      toast.error("Échec de la fin de séance. Vos modifications sont conservées localement.");
      return null;
    }
  }, [session, patient.id, navigate, setSavedDraft]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold">
          {session.id ? "Modifier la séance" : "Nouvelle séance"}
          <span className="ml-2 text-muted-foreground text-lg">
            - {patient.firstName} {patient.lastName}
          </span>
        </h2>
      </div>

      <SessionStatus
        status={session.status}
        onStatusChange={handleStatusChange}
        onSave={saveSession}
        onComplete={completeSession}
        lastSaved={lastSaved}
        isAutoSaving={isAutoSaving}
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <MotifSection
          value={session.motif}
          onChange={(value) => updateField("motif", value)}
          isAutoSaving={isAutoSaving}
          lastSaved={lastSaved}
        />
        
        <CompteRenduSection
          value={session.compteRendu}
          onChange={(value) => updateField("compteRendu", value)}
          isAutoSaving={isAutoSaving}
          lastSaved={lastSaved}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="default" onClick={saveSession}>
          Enregistrer
        </Button>
        {session.status !== "COMPLETED" && (
          <Button variant="default" onClick={completeSession}>
            Terminer la séance
          </Button>
        )}
      </div>
    </div>
  );
}
