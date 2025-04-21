
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

  const getPaymentMethod = (method?: string) => {
    if (!method) return "";
    switch (method) {
      case 'CB': return "Carte Bancaire";
      case 'ESPECES': return "Espèces";
      case 'CHEQUE': return "Chèque";
      case 'VIREMENT': return "Virement bancaire";
      default: return method;
    }
  };

  return (
  <div className="bg-white p-8 max-w-3xl mx-auto">
    {/* En‑tête : Logo ou nom du cabinet */}
    <div className="flex justify-between items-start mb-8">
      <div>
        {cabinet && cabinet.logoUrl ? (
          <img
            src={cabinet.logoUrl}
            alt={`Logo ${cabinet.name}`}
            className="h-16 mb-3"
            style={{ maxWidth: '200px', objectFit: 'contain' }}
          />
        ) : null}

        {/* Nom du cabinet (ou fallback PatientHub) */}
        <h1 className="text-4xl font-extrabold mb-1">
          {cabinet?.name || 'PatientHub'}
        </h1>

        <p className="text-gray-600">
          {osteopath?.professional_title || "Ostéopathe D.O."}
        </p>
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
        <div className="text-gray-600 mt-2 text-sm">
          {osteopath?.siret && <p>SIRET: {osteopath.siret}</p>}
          {osteopath?.adeli_number && <p>ADELI: {osteopath.adeli_number}</p>}
          {osteopath?.ape_code && <p>Code APE: {osteopath.ape_code}</p>}
        </div>
      </div>

      {/* Note d'honoraires */}
      <div className="text-right">
        <h2 className="text-2xl font-medium text-green-800">NOTE D'HONORAIRES</h2>
        <p className="font-medium mt-1">
          #{invoice.id.toString().padStart(4, '0')}
        </p>
        <p className="mt-2 text-gray-600">
          Date d'émission: {formattedDate}
        </p>
        <p className="text-gray-600">
          Statut:{' '}
          <span className="text-green-700 font-semibold">
            {getStatusLabel(invoice.paymentStatus)}
          </span>
        </p>
      </div>
    </div>

    <hr className="my-6 border-green-200" />

    {/* Corps de la facture */}
    <div className="grid grid-cols-2 gap-8 mb-8">
      {/* Facturé à */}
      <div>
        <h3 className="font-medium text-green-800 mb-2">Facturer à :</h3>
        {patient ? (
          <div>
            <p className="font-medium">
              {patient.firstName} {patient.lastName}
            </p>
            {patient.birthDate && (
              <p className="text-gray-600 text-sm">
                Né(e) le {format(new Date(patient.birthDate), "dd/MM/yyyy")}
              </p>
            )}
            {patient.email && <p>{patient.email}</p>}
            {patient.phone && <p>{patient.phone}</p>}
            {patient.address && <p>{patient.address}</p>}
          </div>
        ) : (
          <p>Patient #{invoice.patientId}</p>
        )}
      </div>

      {/* Mode de règlement */}
      <div className="text-right">
        <h3 className="font-medium text-green-800 mb-2">
          Mode de règlement :
        </h3>
        <p className="font-medium">
          {getPaymentMethod(invoice.paymentMethod)}
        </p>
        {invoice.paymentStatus === "PAID" && (
          <p className="text-green-600 font-bold mt-2">ACQUITTÉE</p>
        )}
      </div>
    </div>

    {/* Tableau des montants */}
    <table className="w-full mb-8">
      <thead>
        <tr className="border-b border-green-300">
          <th className="py-2 px-2 text-left text-green-800">Désignation</th>
          <th className="py-2 px-2 text-right text-green-800">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-green-200">
          <td className="py-4 px-2">Consultation d'ostéopathie</td>
          <td className="py-4 px-2 text-right text-green-700 font-bold">
            {formatAmount(invoice.amount)}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr className="font-medium">
          <td className="py-4 px-2 text-right text-green-800">Total</td>
          <td className="py-4 px-2 text-right text-green-700 font-bold">
            {formatAmount(invoice.amount)}
          </td>
        </tr>
      </tfoot>
    </table>

    {/* Mentions et pied de page */}
    <div className="border-t border-green-200 pt-6">
      <h3 className="font-medium text-green-800 mb-2">
        Mentions obligatoires :
      </h3>
      <p className="text-gray-600 mb-3 font-medium text-sm">
        {invoice.tvaMotif ||
          "TVA non applicable - Article 261-4-1° du CGI"}
      </p>
      <p className="text-gray-500 text-sm mb-6">
        En votre aimable règlement à réception. Merci de votre confiance.
      </p>

      <div className="text-center mt-8 space-y-1">
        {/* Nom du site en dégradé */}
        <h1
          className="
            text-3xl md:text-4xl font-bold
            bg-clip-text text-transparent
            bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
            dark:from-blue-500 dark:via-purple-500 dark:to-purple-500
          "
        >
          PatientHub
        </h1>
        <p className="text-gray-500 text-sm">
          Logiciel de gestion pour ostéopathes
        </p>
        <p className="text-gray-400 text-xs">
          Document généré le {currentDate}
        </p>
      </div>
    </div>
  </div>
);
