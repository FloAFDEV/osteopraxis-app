
import { authService } from './auth-service';
import { patientService } from './patient-service';
import { appointmentService } from './appointment-service';
import { consultationService } from './consultation-service';
import { invoiceService } from './invoice-service';
import { cabinetService } from './cabinet-service';
import { userService } from './user-service';
import { professionalProfileService } from './professional-profile-service';

// Rename osteopathService to professionalProfileService for backward compatibility
export const api = {
  ...authService,
  ...patientService,
  ...appointmentService,
  ...consultationService,
  ...invoiceService,
  ...cabinetService,
  ...userService,
  ...professionalProfileService,
  
  // Add promoteToAdmin method
  async promoteToAdmin(userId: string): Promise<void> {
    try {
      await userService.updateUserRole(userId, 'ADMIN');
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      throw error;
    }
  }
};
