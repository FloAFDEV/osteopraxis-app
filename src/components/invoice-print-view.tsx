
import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, Patient, ProfessionalProfile, Cabinet } from '@/types';

interface InvoicePrintViewProps {
  invoice: Invoice;
  patient: Patient;
  professionalProfile?: ProfessionalProfile;
  cabinet?: Cabinet;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ 
  invoice, 
  patient, 
  professionalProfile,
  cabinet
}) => {
  const invoiceDate = parseISO(invoice.date);
  const formattedDate = format(invoiceDate, 'dd MMMM yyyy', { locale: fr });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Facture N°{invoice.id}</h1>
          <p>Date: {formattedDate}</p>
        </div>
        <div>
          {cabinet?.name && <p className="font-bold">{cabinet.name}</p>}
          {cabinet?.address && <p>{cabinet.address}</p>}
          {cabinet?.phone && <p>Téléphone: {cabinet.phone}</p>}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Patient</h2>
        <p>Nom: {patient.firstName} {patient.lastName}</p>
        {patient.address && <p>Adresse: {patient.address}</p>}
        {patient.phone && <p>Téléphone: {patient.phone}</p>}
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Détails de la consultation</h2>
        <p>Consultation N°: {invoice.consultationId}</p>
        <p>Montant: {invoice.amount} €</p>
        {invoice.tvaExoneration && <p>Exonération de TVA: Oui</p>}
        {invoice.tvaMotif && <p>Motif d'exonération: {invoice.tvaMotif}</p>}
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Paiement</h2>
        <p>Statut: {invoice.paymentStatus}</p>
      </div>

      {professionalProfile && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Informations du professionnel de santé</h2>
          <div className="mt-4">
            <p className="font-bold">{professionalProfile.name}</p>
            <p>{professionalProfile.title}</p>
            <p>N° ADELI: {professionalProfile.adeli_number || "-"}</p>
            <p>N° SIRET: {professionalProfile.siret || "-"}</p>
            <p>Code APE: {professionalProfile.ape_code || "8690F"}</p>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p>Merci de votre confiance !</p>
      </div>
    </div>
  );
};
