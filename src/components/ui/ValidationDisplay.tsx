
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { SecurityService } from '@/services/supabase-api/security-service';

interface ValidationDisplayProps {
  type: 'email' | 'phone';
  value: string;
  className?: string;
}

export function ValidationDisplay({ type, value, className }: ValidationDisplayProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setIsValid(null);
      return;
    }

    const validateValue = async () => {
      setLoading(true);
      try {
        let result = false;
        
        if (type === 'email') {
          result = await SecurityService.validateEmail(value);
        } else if (type === 'phone') {
          result = await SecurityService.validatePhone(value);
        }
        
        setIsValid(result);
      } catch (error) {
        console.error(`Erreur lors de la validation ${type}:`, error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    // Débounce pour éviter trop de validations
    const timeoutId = setTimeout(validateValue, 500);
    
    return () => clearTimeout(timeoutId);
  }, [value, type]);

  if (!value || value.trim() === '' || loading) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1 text-sm ${className}`}>
      {isValid === true ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Valide</span>
        </>
      ) : isValid === false ? (
        <>
          <X className="h-4 w-4 text-red-500" />
          <span className="text-red-600">
            {type === 'email' ? 'Email invalide' : 'Numéro invalide'}
          </span>
        </>
      ) : null}
    </div>
  );
}
