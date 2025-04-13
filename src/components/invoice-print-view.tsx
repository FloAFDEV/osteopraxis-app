
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Invoice, Patient, Osteopath, Cabinet } from "@/types";

interface InvoicePrintViewProps {
  invoice: Invoice;
  patient?: Patient;
  osteopath?: Osteopath;
  cabinet?: Cabinet;
}

export const InvoicePrintView = ({ invoice, patient, osteopath, cabinet }: InvoicePrintViewProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formattedDate = format(new Date(invoice.date), "dd MMMM yyyy", { locale: fr });
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return "Payée";
      case 'PENDING': return "En attente";
      case 'CANCELED': return "Annulée";
      default: return "Inconnue";
    }
  };

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          {cabinet && cabinet.logoUrl ? (
            <img 
              src={cabinet.logoUrl} 
              alt={`Logo ${cabinet.name}`} 
              className="h-16 mb-3"
              style={{ maxWidth: '200px', objectFit: 'contain' }}
            />
          ) : (
            <h1 className="text-3xl font-bold text-blue-800">{cabinet?.name || "PatientHub"}</h1>
          )}
          <p className="text-gray-600">{osteopath?.professional_title || "Gestion de cabinet d'ostéopathie"}</p>
          <p className="text-gray-600 mt-2">
            {cabinet ? (
              <>
                {cabinet.address}<br />
                {cabinet.phone && <>{cabinet.phone}<br /></>}
                {cabinet.email && <>{cabinet.email}<br /></>}
              </>
            ) : (
              <>
                123 Rue de la Santé<br />
                75001 Paris, France<br />
                Tél: 01 23 45 67 89
              </>
            )}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-medium text-gray-800">FACTURE</h2>
          <p className="font-medium mt-1">#{invoice.id.toString().padStart(4, '0')}</p>
          <p className="mt-2 text-gray-600">Date d'émission: {formattedDate}</p>
          <p className="text-gray-600">Statut: {getStatusLabel(invoice.paymentStatus)}</p>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Facturer à:</h3>
          {patient ? (
            <div>
              <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              {patient.email && <p>{patient.email}</p>}
              {patient.phone && <p>{patient.phone}</p>}
              {patient.address && <p>{patient.address}</p>}
            </div>
          ) : (
            <p>Patient #{invoice.patientId}</p>
          )}
        </div>
        <div className="text-right">
          <h3 className="font-medium text-gray-800 mb-2">Informations professionnelles:</h3>
          <p className="font-medium">{osteopath?.name || "Cabinet d'ostéopathie"}</p>
          {osteopath?.siret && <p>SIRET: {osteopath.siret}</p>}
          {osteopath?.adeli_number && <p>ADELI: {osteopath.adeli_number}</p>}
          {osteopath?.ape_code && <p>Code APE: {osteopath.ape_code}</p>}
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 px-2 text-left">Description</th>
            <th className="py-2 px-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-4 px-2">Consultation d'ostéopathie</td>
            <td className="py-4 px-2 text-right">{formatAmount(invoice.amount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="py-4 px-2 text-right">Total</td>
            <td className="py-4 px-2 text-right">{formatAmount(invoice.amount)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-800 mb-2">Notes:</h3>
        <p className="text-gray-600 mb-6">
          Merci de votre confiance. Cette facture est payable dans un délai de 30 jours.
          Veuillez inclure le numéro de facture dans votre communication de paiement.
        </p>
        
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Document généré le {currentDate}</p>
          <p className="mt-1">PatientHub - Logiciel de gestion pour ostéopathes</p>
        </div>
      </div>
    </div>
  );
};
