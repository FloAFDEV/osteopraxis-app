
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from "./patient-queries";

export const patientService = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};

export default patientService;
export { patientService as supabasePatientService, updatePatient };
