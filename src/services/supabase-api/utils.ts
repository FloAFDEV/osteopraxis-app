import { SUPABASE_API_URL, SUPABASE_API_KEY } from "@/integrations/supabase/client";
import { AppointmentStatus } from "./appointment/appointment-types";

/**
 * Function to convert a base64 string to a file
 */
export function base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

/**
 * Function to convert a File to a base64 string
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Utility function to ensure a value is a valid AppointmentStatus
 * @param value The value to check
 * @returns The value if it is a valid AppointmentStatus, otherwise throws an error
 */
export function ensureAppointmentStatus(value: any): AppointmentStatus {
    if (!AppointmentStatusValues.includes(value)) {
        throw new Error(`Invalid AppointmentStatus: ${value}`);
    }
    return value as AppointmentStatus;
}

/**
 * Array of valid AppointmentStatus values
 */
export const AppointmentStatusValues: AppointmentStatus[] = [
    "SCHEDULED",
    "COMPLETED",
    "CANCELED",
    "NO_SHOW",
    "RESCHEDULED"
];

/**
 * Fonction utilitaire pour typer correctement les résultats des requêtes Supabase
 * Cette fonction aide à éviter les erreurs "Type instantiation is excessively deep and possibly infinite"
 */
export function typedData<T>(data: any): T {
  return data as T;
}
