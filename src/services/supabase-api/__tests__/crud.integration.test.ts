import { api } from '../api';

describe('CRUD Operations Integration Tests', () => {
  it('should create, read, update, and delete a patient', async () => {
    const patientData = {
      firstName: 'Test',
      lastName: 'Patient',
      osteopathId: 1,
    };

    const createdPatient = await api.createPatient(patientData);
    expect(createdPatient).toBeDefined();
    expect(createdPatient.firstName).toBe(patientData.firstName);

    const patientId = createdPatient.id;
    const updatedPatientData = { firstName: 'Updated' };
    const updatedPatient = await api.updatePatient(patientId, updatedPatientData);
    expect(updatedPatient).toBeDefined();
    expect(updatedPatient?.firstName).toBe(updatedPatientData.firstName);

    const retrievedPatient = await api.getPatientById(patientId);
    expect(retrievedPatient).toBeDefined();
    expect(retrievedPatient?.firstName).toBe(updatedPatientData.firstName);

    await api.deletePatient(patientId);
    try {
      await api.getPatientById(patientId);
    } catch (error: any) {
      expect(error.message).toContain('Patient not found');
    }
  });

  it('should create, read, update, and delete an appointment', async () => {
    const appointmentData = {
      patientId: 1,
      date: new Date().toISOString(),
      reason: 'Test Reason',
      status: 'SCHEDULED' as const,
    };

    const createdAppointment = await api.createAppointment(appointmentData);
    expect(createdAppointment).toBeDefined();
    expect(createdAppointment.reason).toBe(appointmentData.reason);

    const appointmentId = createdAppointment.id;
    const updatedAppointmentData = { reason: 'Updated Reason' };
    const updatedAppointment = await api.updateAppointment(appointmentId, updatedAppointmentData);
    expect(updatedAppointment).toBeDefined();
    expect(updatedAppointment?.reason).toBe(updatedAppointmentData.reason);

    const retrievedAppointment = await api.getAppointmentById(appointmentId);
    expect(retrievedAppointment).toBeDefined();
    expect(retrievedAppointment?.reason).toBe(updatedAppointmentData.reason);

    await api.deleteAppointment(appointmentId);
    try {
      await api.getAppointmentById(appointmentId);
    } catch (error: any) {
      expect(error.message).toContain('Appointment not found');
    }
  });

  it('should create, read, update, and delete a cabinet', async () => {
    const cabinetData = {
      name: "Test Cabinet",
      address: "123 Test St",
      phone: "1234567890",
      imageUrl: null,
      logoUrl: null,
      osteopathId: 1,
      city: "Test City",
      province: "Test Province",
      postalCode: "12345",
      country: "Test Country",
    };

    const createdCabinet = await api.createCabinet(cabinetData);
    expect(createdCabinet).toBeDefined();
    expect(createdCabinet.name).toBe(cabinetData.name);

    const cabinetId = createdCabinet.id;
    const updatedCabinetData = { name: 'Updated Cabinet' };
    const updatedCabinet = await api.updateCabinet(cabinetId, updatedCabinetData);
    expect(updatedCabinet).toBeDefined();
    expect(updatedCabinet?.name).toBe(updatedCabinetData.name);

    const retrievedCabinet = await api.getCabinetById(cabinetId);
    expect(retrievedCabinet).toBeDefined();
    expect(retrievedCabinet?.name).toBe(updatedCabinetData.name);

    await api.deleteCabinet(cabinetId);
    try {
      await api.getCabinetById(cabinetId);
    } catch (error: any) {
      expect(error.message).toContain('Cabinet not found');
    }
  });

  it('should create, read, update, and delete an invoice', async () => {
    const invoiceData = {
      patientId: 1,
      appointmentId: 1,
      date: new Date().toISOString(),
      amount: 100,
      paymentStatus: "PENDING" as const,
      cabinetId: 1,
      invoiceNumber: "INV-001",
    };

    const createdInvoice = await api.createInvoice(invoiceData);
    expect(createdInvoice).toBeDefined();
    expect(createdInvoice.amount).toBe(invoiceData.amount);

    const invoiceId = createdInvoice.id;
    const updatedInvoiceData = { amount: 200 };
    const updatedInvoice = await api.updateInvoice(invoiceId, updatedInvoiceData);
    expect(updatedInvoice).toBeDefined();
    expect(updatedInvoice?.amount).toBe(updatedInvoiceData.amount);

    const retrievedInvoice = await api.getInvoiceById(invoiceId);
    expect(retrievedInvoice).toBeDefined();
    expect(retrievedInvoice?.amount).toBe(updatedInvoiceData.amount);

    await api.deleteInvoice(invoiceId);
    try {
      await api.getInvoiceById(invoiceId);
    } catch (error: any) {
      expect(error.message).toContain('Invoice not found');
    }
  });
});
