
import React, { useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Invoice, Patient, Osteopath, Cabinet, PaymentStatus } from "@/types";

interface InvoicePrintViewProps {
  invoice: Invoice;
  patient?: Patient;
  osteopath?: Osteopath;
  cabinet?: Cabinet;
}

const getPaymentStatusText = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "Payée";
    case "PENDING":
      return "En attente";
    case "CANCELED":
      return "Annulée";
    default:
      return "Inconnu";
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method) {
    case "CB":
      return "Carte bancaire";
    case "ESPECES":
      return "Espèces";
    case "CHEQUE":
      return "Chèque";
    case "VIREMENT":
      return "Virement";
    default:
      return "Non spécifié";
  }
};

export const printRef = React.createRef<HTMLDivElement>();

export function InvoicePrintView({ invoice, patient, osteopath, cabinet }: InvoicePrintViewProps) {
  return (
    <div ref={printRef} className="p-8 max-w-3xl mx-auto bg-white text-black">
      <div className="flex justify-between items-start mb-8">
        <div>
          {/* Osteopath details */}
          <h1 className="text-2xl font-bold">{osteopath?.name || "Ostéopathe"}</h1>
          <p className="text-gray-700">{osteopath?.professional_title || "Ostéopathe D.O."}</p>
          <p className="text-gray-700">ADELI: {osteopath?.adeli_number || "N/A"}</p>
          <p className="text-gray-700">SIRET: {osteopath?.siret || "N/A"}</p>
          
          {/* Cabinet details if available */}
          {cabinet && (
            <div className="mt-2">
              <p className="text-gray-700">{cabinet.name}</p>
              <p className="text-gray-700">{cabinet.address}</p>
              <p className="text-gray-700">{cabinet.zip_code} {cabinet.city}</p>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <h1 className="text-xl font-bold mb-1">NOTE D'HONORAIRE</h1>
          <p className="text-gray-700">N° {invoice.id.toString().padStart(4, '0')}</p>
          <p className="text-gray-700">
            Date: {format(new Date(invoice.date), "dd MMMM yyyy", { locale: fr })}
          </p>
        </div>
      </div>

      {/* Patient information */}
      <div className="mb-8 p-4 border border-gray-200 rounded-md">
        <h2 className="text-gray-700 font-semibold mb-2">Patient:</h2>
        <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
        {patient?.address && <p className="text-gray-600">{patient.address}</p>}
        {patient?.email && <p className="text-gray-600">{patient.email}</p>}
        {patient?.phone && <p className="text-gray-600">{patient.phone}</p>}
      </div>

      {/* Services */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-2">Consultation d'ostéopathie - Séance</td>
            <td className="text-right p-2">{invoice.amount.toFixed(2)} €</td>
          </tr>
          {/* Add taxes row if applicable */}
          <tr className="border-b border-gray-200">
            <td colSpan={1} className="p-2 text-right font-semibold">Total:</td>
            <td className="text-right p-2 font-bold">{invoice.amount.toFixed(2)} €</td>
          </tr>
        </tbody>
      </table>

      {/* Payment details */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Détails de paiement:</h2>
        <p>Statut: <span className="font-medium">{getPaymentStatusText(invoice.paymentStatus)}</span></p>
        {invoice.paymentMethod && <p>Méthode: <span className="font-medium">{getPaymentMethodText(invoice.paymentMethod)}</span></p>}
      </div>

      {/* Legal mentions */}
      <div className="text-sm text-gray-600 mb-8">
        <p>{invoice.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI"}</p>
        {invoice.notes && <p className="mt-2">{invoice.notes}</p>}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-16">
        <p>Merci pour votre confiance</p>
      </div>
    </div>
  );
}
