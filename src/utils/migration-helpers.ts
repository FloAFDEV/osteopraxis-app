
import { Cabinet, ProfessionalProfile } from "@/types";

/**
 * Migration helpers for transitioning from Osteopath to ProfessionalProfile
 * These utilities help maintain backward compatibility during the migration
 */

export const migrateOsteopathFieldsToProfessionalProfile = (oldObj: any): Partial<ProfessionalProfile> => {
  const result: Partial<ProfessionalProfile> = {};
  
  // Map fields from old Osteopath to new ProfessionalProfile
  if (oldObj?.name) result.name = oldObj.name;
  if (oldObj?.professional_title) result.title = oldObj.professional_title;
  if (oldObj?.title) result.title = oldObj.title;
  if (oldObj?.userId) result.userId = oldObj.userId;
  if (oldObj?.adeli_number) result.adeli_number = oldObj.adeli_number;
  if (oldObj?.siret) result.siret = oldObj.siret;
  if (oldObj?.ape_code) result.ape_code = oldObj.ape_code;
  
  // Set default profession_type if not provided
  if (oldObj?.profession_type) {
    result.profession_type = oldObj.profession_type;
  } else {
    result.profession_type = "osteopathe";
  }
  
  // Copy timestamp fields if they exist
  if (oldObj?.createdAt) result.createdAt = oldObj.createdAt;
  if (oldObj?.updatedAt) result.updatedAt = oldObj.updatedAt;
  
  return result;
};

export const migrateCabinetFields = (oldObj: any): Partial<Cabinet> => {
  const result: Partial<Cabinet> = {};
  
  // Copy standard fields
  if (oldObj?.name) result.name = oldObj.name;
  if (oldObj?.address) result.address = oldObj.address;
  if (oldObj?.phone) result.phone = oldObj.phone;
  if (oldObj?.email) result.email = oldObj.email;
  if (oldObj?.logoUrl) result.logoUrl = oldObj.logoUrl;
  if (oldObj?.imageUrl) result.imageUrl = oldObj.imageUrl;
  
  // Map osteopathId to professionalProfileId if needed
  if (oldObj?.professionalProfileId) {
    result.professionalProfileId = oldObj.professionalProfileId;
  } else if (oldObj?.osteopathId) {
    result.professionalProfileId = oldObj.osteopathId;
    console.warn("Migrating osteopathId to professionalProfileId: ", oldObj.osteopathId);
  }
  
  // Copy timestamp fields if they exist
  if (oldObj?.createdAt) result.createdAt = oldObj.createdAt;
  if (oldObj?.updatedAt) result.updatedAt = oldObj.updatedAt;
  
  return result;
};

export const migrateUserFields = (oldObj: any): any => {
  const result = { ...oldObj };
  
  // Map osteopathId to professionalProfileId if needed
  if (oldObj?.professionalProfileId) {
    result.professionalProfileId = oldObj.professionalProfileId;
  } else if (oldObj?.osteopathId) {
    result.professionalProfileId = oldObj.osteopathId;
    console.warn("Migrating user.osteopathId to user.professionalProfileId: ", oldObj.osteopathId);
    delete result.osteopathId;
  }
  
  return result;
};
