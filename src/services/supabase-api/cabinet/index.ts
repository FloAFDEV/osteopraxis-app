
import { getCabinets } from './getCabinets';
import { getCabinetById } from './getCabinetById';
import { getCabinetsByOsteopathId } from './getCabinetsByOsteopathId';
import { getCabinetsByUserId } from './getCabinetsByUserId';
import { createCabinet } from './createCabinet';
import { updateCabinet } from './updateCabinet';
import { updateTimestamps } from './updateTimestamps';
import { deleteCabinet } from './deleteCabinet';

// Export the cabinet service as a unified object
export const supabaseCabinetService = {
  getCabinets,
  getCabinetById,
  getCabinetsByOsteopathId,
  getCabinetsByUserId,
  createCabinet,
  updateCabinet,
  updateTimestamps,
  deleteCabinet
};

// Also export individual functions for more granular imports
export {
  getCabinets,
  getCabinetById,
  getCabinetsByOsteopathId,
  getCabinetsByUserId,
  createCabinet,
  updateCabinet,
  updateTimestamps,
  deleteCabinet
};
