import { Control } from "react-hook-form";

export interface FormControlProps<T = Record<string, unknown>> {
  control: Control<T>;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface InvoiceFormData {
  patientId: number;
  amount: number;
  date: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  cabinetId?: number;
  osteopathId?: number;
}

export interface InvoiceControlProps extends FormControlProps<InvoiceFormData> {}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  height?: number;
  weight?: number;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  cabinetId?: number;
}