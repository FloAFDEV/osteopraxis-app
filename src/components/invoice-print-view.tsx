import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, Patient, ProfessionalProfile } from '@/types';

interface InvoicePrintViewProps {
  invoice: Invoice;
  patient: Patient;
  osteopath?: ProfessionalProfile;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, patient, osteopath }) => {
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
          {/* Replace with your cabinet logo or name */}
          <p className="font-bold">Cabinet d'Ostéopathie</p>
          <p>Adresse du cabinet</p>
          <p>Téléphone: Numéro de téléphone</p>
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

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Informations du professionnel de santé</h2>
        
        <div className="mt-4">
          <p className="font-bold">{osteopath?.name}</p>
          <p>{osteopath?.title || "Ostéopathe D.O."}</p>
          <p>N° ADELI: {osteopath?.adeli_number || "-"}</p>
          <p>N° SIRET: {osteopath?.siret || "-"}</p>
          <p>Code APE: {osteopath?.ape_code || "8690F"}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p>Merci de votre confiance !</p>
      </div>
    </div>
  );
};
