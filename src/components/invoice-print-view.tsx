
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
    <div className="bg-white p-6 max-w-3xl mx-auto text-sm">
      {/* En-tête avec logo et infos cabinet */}
      <div className="flex justify-between items-start mb-4">
        <div className="max-w-[50%]">
          <h1 className="text-2xl font-bold mb-1 text-amber-700">{cabinet?.name || "PatientHub"}</h1>
          {cabinet?.logoUrl && (
            <img src={cabinet.logoUrl} alt={`Logo ${cabinet.name}`} className="h-12 mb-2 object-contain" />
          )}
          <div className="text-xs space-y-0.5 text-gray-600">
            {osteopath?.professional_title && <p>{osteopath.professional_title}</p>}
            {cabinet?.address && <p>{cabinet.address}</p>}
            {cabinet?.phone && <p>Tél: {cabinet.phone}</p>}
            {cabinet?.email && <p>{cabinet.email}</p>}
            <div className="text-[11px] mt-1 space-y-0.5">
              {osteopath?.siret && <p>SIRET: {osteopath.siret}</p>}
              {osteopath?.adeli_number && <p>ADELI: {osteopath.adeli_number}</p>}
              {osteopath?.ape_code && <p>Code APE: {osteopath.ape_code}</p>}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-lg font-semibold text-amber-700 mb-1">NOTE D'HONORAIRES</h2>
          <p className="font-medium mb-2">#{invoice.id.toString().padStart(4, '0')}</p>
          <div className="text-xs space-y-0.5 text-gray-600">
            <p>Date d'émission: {formattedDate}</p>
            <p>Statut: <span className="text-amber-600 font-semibold">{getStatusLabel(invoice.paymentStatus)}</span></p>
          </div>
        </div>
      </div>

      <hr className="my-3 border-amber-200" />
      
      {/* Informations client et paiement */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <h3 className="font-medium text-amber-700 mb-1">Facturer à:</h3>
          <div className="space-y-0.5 text-gray-600">
            {patient ? (
              <>
                <p className="font-medium text-gray-800">{patient.firstName} {patient.lastName}</p>
                {patient.birthDate && 
                  <p>Né(e) le {format(new Date(patient.birthDate), "dd/MM/yyyy")}</p>
                }
                {patient.email && <p>{patient.email}</p>}
                {patient.phone && <p>{patient.phone}</p>}
                {patient.address && <p>{patient.address}</p>}
              </>
            ) : (
              <p>Patient #{invoice.patientId}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-medium text-amber-700 mb-1">Mode de règlement:</h3>
          <p className="font-medium text-gray-800">{getPaymentMethod(invoice.paymentMethod)}</p>
          {invoice.paymentStatus === "PAID" && 
            <p className="text-amber-600 font-bold mt-1">ACQUITTÉE</p>
          }
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="border border-amber-200 rounded mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-amber-50">
              <th className="py-2 px-3 text-left text-amber-700 font-medium">Désignation</th>
              <th className="py-2 px-3 text-right text-amber-700 font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-amber-100">
              <td className="py-2 px-3 text-gray-700">Consultation d'ostéopathie</td>
              <td className="py-2 px-3 text-right text-amber-700 font-medium">{formatAmount(invoice.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-amber-100 bg-amber-50/50">
              <td className="py-2 px-3 text-right text-amber-700 font-medium">Total</td>
              <td className="py-2 px-3 text-right text-amber-700 font-bold">{formatAmount(invoice.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mentions légales */}
      <div className="text-xs space-y-2 text-gray-600 mb-4">
        <p className="font-medium">{invoice.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI"}</p>
        <p>En votre aimable règlement à réception. Merci de votre confiance.</p>
      </div>
      
      {/* Pied de page */}
      <div className="text-center border-t border-amber-100 pt-2 mt-auto">
        <p className="text-[10px] text-gray-500">Document généré le {currentDate}</p>
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          PatientHub
        </h1>
        <p className="text-[10px] text-gray-500">Logiciel de gestion pour ostéopathes</p>
      </div>
    </div>
  );
};

