
import { getPatients } from "./patient/getPatients";
import { getPatientById } from "./patient/getPatientById";
import { createPatient } from "./patient/createPatient";
import { updatePatient } from "./patient/updatePatient";
import { deletePatient } from "./patient/deletePatient";
export {
  getCurrentOsteopathId,
  isPatientOwnedByCurrentOsteopath,
} from "./utils/getCurrentOsteopath";

export const patientService = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};

export default patientService;
export { patientService as supabasePatientService, updatePatient };
