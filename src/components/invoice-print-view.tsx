
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
    if (!method) return "Non spécifié";
    switch (method) {
      case 'CB': return "Carte Bancaire";
      case 'ESPECES': return "Espèces";
      case 'CHEQUE': return "Chèque";
      case 'VIREMENT': return "Virement bancaire";
      default: return method;
    }
  };

  const getPatientName = () => {
    if (patient) {
      return `${patient.firstName} ${patient.lastName}`;
    }
    if (invoice.Patient) {
      return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
    }
    return `Patient #${invoice.patientId}`;
  };

  return (
    <div className="bg-white p-8 min-h-screen max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-amber-700">
            {cabinet?.name || "PatientHub"}
          </h1>
          {cabinet?.logoUrl && (
            <img 
              src={cabinet.logoUrl} 
              alt={`Logo ${cabinet.name}`} 
              className="h-16 mb-3"
              style={{ maxWidth: '200px', objectFit: 'contain' }}
            />
          )}
          <p className="text-gray-700 font-medium">{osteopath?.professional_title || "Ostéopathe D.O."}</p>
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
            {osteopath?.siret && <p className="font-medium">SIRET: {osteopath.siret}</p>}
            {osteopath?.adeli_number && <p className="font-medium">ADELI: {osteopath.adeli_number}</p>}
            {osteopath?.ape_code && <p className="font-medium">Code APE: {osteopath.ape_code}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-medium text-amber-700 mb-1">NOTE D'HONORAIRES</h2>
          <p className="font-medium text-amber-600">#{invoice.id.toString().padStart(4, '0')}</p>
          <p className="mt-4 text-gray-600">Date de consultation: {formattedDate}</p>
          <p className="text-gray-600">
            Statut: <span className="text-amber-600 font-semibold">{getStatusLabel(invoice.paymentStatus)}</span>
          </p>
        </div>
      </div>

      {/* Informations patient et paiement */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="font-medium text-amber-700 mb-3">Facturer à:</h3>
          <div className="border-l-4 border-amber-200 pl-4">
            <p className="font-medium text-gray-800 text-lg mb-2">{getPatientName()}</p>
            {patient?.birthDate && 
              <p className="text-gray-600 text-sm mb-2">
                Né(e) le {format(new Date(patient.birthDate), "dd/MM/yyyy")}
              </p>
            }
            {patient?.email && <p className="text-gray-600">{patient.email}</p>}
            {patient?.phone && <p className="text-gray-600">{patient.phone}</p>}
            {patient?.address && <p className="text-gray-600">{patient.address}</p>}
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-medium text-amber-700 mb-3">Mode de règlement:</h3>
          <p className="font-medium text-gray-800">{getPaymentMethod(invoice.paymentMethod)}</p>
          {invoice.paymentStatus === "PAID" && 
            <p className="text-amber-600 font-bold text-lg mt-2">ACQUITTÉE</p>
          }
        </div>
      </div>

      {/* Tableau des prestations */}
      <div className="rounded-lg border border-amber-200 overflow-hidden mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left text-amber-700 font-semibold">Désignation</th>
              <th className="py-3 px-4 text-right text-amber-700 font-semibold">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-amber-200">
              <td className="py-4 px-4 text-gray-700">Consultation d'ostéopathie</td>
              <td className="py-4 px-4 text-right text-amber-700 font-bold">{formatAmount(invoice.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-amber-200 bg-amber-50/50">
              <td className="py-4 px-4 text-right text-amber-700 font-medium">Total</td>
              <td className="py-4 px-4 text-right text-amber-700 font-bold">{formatAmount(invoice.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mentions légales */}
      <div className="mt-8">
        <h3 className="font-medium text-amber-700 mb-2">Mentions obligatoires:</h3>
        <p className="text-gray-700 mb-3 font-medium">
          {invoice.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI"}
        </p>
        <p className="text-gray-600 mb-6">
          En votre aimable règlement à réception.
          Merci de votre confiance.
        </p>
  <div className="flex justify-center items-center mt-12 space-x-4 text-gray-500 text-xs">
  <span>Document généré le {currentDate}</span>
  <span>|</span>
  <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">PatientHub</span>
  <span>|</span>
  <span>Logiciel de gestion pour ostéopathes</span>
</div>
      </div>
    </div>
  );
};
