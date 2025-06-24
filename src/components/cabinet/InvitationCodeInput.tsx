
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, CheckCircle, AlertCircle } from "lucide-react";
import { cabinetInvitationService } from "@/services/supabase-api/cabinet-invitation-service";

interface InvitationCodeInputProps {
  initialCode?: string;
  onValidCode?: (code: string, cabinetName: string) => void;
  onInvalidCode?: () => void;
}

export function InvitationCodeInput({ 
  initialCode = "", 
  onValidCode, 
  onInvalidCode 
}: InvitationCodeInputProps) {
  const [code, setCode] = useState(initialCode);
  const [validationStatus, setValidationStatus] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    cabinetName?: string;
    error?: string;
  }>({ isChecking: false, isValid: null });

  useEffect(() => {
    if (initialCode) {
      validateCode(initialCode);
    }
  }, [initialCode]);

  const validateCode = async (codeToValidate: string) => {
    if (!codeToValidate.trim()) {
      setValidationStatus({ isChecking: false, isValid: null });
      return;
    }

    try {
      setValidationStatus({ isChecking: true, isValid: null });
      
      const result = await cabinetInvitationService.validateInvitationCode(codeToValidate.trim().toUpperCase());
      
      setValidationStatus({
        isChecking: false,
        isValid: result.valid,
        cabinetName: result.cabinet_name,
        error: result.valid ? undefined : "Code invalide ou expiré"
      });

      if (result.valid && result.cabinet_name) {
        onValidCode?.(codeToValidate.trim().toUpperCase(), result.cabinet_name);
      } else {
        onInvalidCode?();
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setValidationStatus({
        isChecking: false,
        isValid: false,
        error: "Erreur lors de la validation"
      });
      onInvalidCode?();
    }
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setCode(upperValue);
    
    // Validation automatique après 8 caractères
    if (upperValue.length === 8) {
      validateCode(upperValue);
    } else if (upperValue.length < 8) {
      setValidationStatus({ isChecking: false, isValid: null });
    }
  };

  const handleManualValidation = () => {
    validateCode(code);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="invitation-code">Code d'invitation</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="invitation-code"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="ABC12345"
            className="font-mono text-center"
            maxLength={8}
          />
          <Button 
            variant="outline" 
            onClick={handleManualValidation}
            disabled={!code.trim() || validationStatus.isChecking}
            size="sm"
          >
            {validationStatus.isChecking ? "..." : "Vérifier"}
          </Button>
        </div>
      </div>

      {validationStatus.isValid === true && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span><strong>Code valide !</strong> Cabinet : {validationStatus.cabinetName}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validationStatus.isValid === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationStatus.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
