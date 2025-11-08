import { forwardRef } from 'react';
import { Quote, Patient, Osteopath, Cabinet } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDemo } from '@/contexts/DemoContext';

interface QuotePrintViewProps {
  quote: Quote;
  patient: Patient | null;
  osteopath: Osteopath | null;
  cabinet: Cabinet | null;
  items?: any[];
}

export const QuotePrintView = forwardRef<HTMLDivElement, QuotePrintViewProps>(
  ({ quote, patient, osteopath, cabinet, items = [] }, ref) => {
    const { isDemoMode } = useDemo();

    const getPatientName = () => {
      if (!patient) return 'Patient inconnu';
      return `${patient.firstName} ${patient.lastName}`;
    };

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const quoteNumber = quote.id.toString().padStart(6, '0');
    const quoteDate = quote.createdAt;
    const quoteSubject = quote.title || quote.description;

    return (
      <div ref={ref} className="bg-white p-8 text-black relative">
        {/* 🔒 SÉCURITÉ: Filigrane MODE DÉMO basé sur la session */}
        {isDemoMode && (
          <>
            {/* Bandeau rouge en haut */}
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2 font-bold text-sm z-20">
              ⚠️ DEVIS DE DÉMONSTRATION - NON UTILISABLE À DES FINS OFFICIELLES
            </div>
            
            {/* Filigrane central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="transform -rotate-45 text-red-200 font-bold text-6xl opacity-50 select-none">
                MODE DÉMO
              </div>
            </div>
          </>
        )}

        {/* En-tête avec informations cabinet/ostéopathe */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-gray-200 pb-6">
          <div className="flex-1">
            {cabinet ? (
              <>
                <h2 className="text-xl font-bold text-gray-800">{cabinet.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{cabinet.address}</p>
                {cabinet.phone && <p className="text-sm text-gray-600">Tél : {cabinet.phone}</p>}
                {cabinet.email && <p className="text-sm text-gray-600">Email : {cabinet.email}</p>}
              </>
            ) : osteopath ? (
              <>
                <h2 className="text-xl font-bold text-gray-800">{osteopath.name}</h2>
                {osteopath.professional_title && (
                  <p className="text-sm text-gray-600">{osteopath.professional_title}</p>
                )}
                {osteopath.rpps_number && (
                  <p className="text-sm text-gray-600">N° RPPS : {osteopath.rpps_number}</p>
                )}
              </>
            ) : null}
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-bold text-primary mb-2">DEVIS</h1>
            <p className="text-sm text-gray-600">N° {quoteNumber}</p>
            <p className="text-sm text-gray-600">
              Date : {quoteDate ? format(new Date(quoteDate), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
            </p>
            {quote.validUntil && (
              <p className="text-sm text-gray-600">
                Valide jusqu'au : {format(new Date(quote.validUntil), 'dd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
        </div>

        {/* Informations patient */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">PATIENT</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold text-gray-800">{getPatientName()}</p>
            {patient?.email && <p className="text-sm text-gray-600">Email : {patient.email}</p>}
            {patient?.phone && <p className="text-sm text-gray-600">Tél : {patient.phone}</p>}
            {patient?.address && <p className="text-sm text-gray-600">Adresse : {patient.address}</p>}
          </div>
        </div>

        {/* Objet du devis */}
        {quoteSubject && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">OBJET</h3>
            <p className="text-sm text-gray-800">{quoteSubject}</p>
          </div>
        )}

        {/* Tableau des prestations */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold w-24">
                  Quantité
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold w-32">
                  Prix unitaire
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold w-32">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                    {formatAmount(item.unitPrice)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                    {formatAmount(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="border border-gray-300 px-4 py-3 text-right font-bold">
                  TOTAL
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-lg text-primary">
                  {formatAmount(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">NOTES</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* Conditions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">CONDITIONS</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Devis valable {quote.validUntil ? 'jusqu\'à la date indiquée' : '30 jours'}</li>
            <li>• Paiement à réception de la note d'honoraires</li>
            <li>• Consultations non remboursées par la Sécurité Sociale</li>
            <li>• Possibilité de prise en charge par certaines mutuelles</li>
          </ul>
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-between items-end">
          <div className="w-1/2">
            <p className="text-xs text-gray-600 mb-4">Signature du patient (précédée de "Bon pour accord")</p>
            <div className="border-b border-gray-400 w-48 h-16"></div>
          </div>
          
          <div className="w-1/2 text-right">
            <p className="text-xs text-gray-600 mb-4">Signature et cachet du praticien</p>
            <div className="border-b border-gray-400 w-48 h-16 ml-auto"></div>
          </div>
        </div>

        {/* Mentions légales */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {osteopath?.siret && `SIRET : ${osteopath.siret} • `}
            {osteopath?.rpps_number && `N° RPPS : ${osteopath.rpps_number} • `}
            {osteopath?.ape_code && `Code APE : ${osteopath.ape_code}`}
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Profession libérale non assujettie à la TVA - Article 293B du CGI
          </p>
        </div>
      </div>
    );
  }
);

QuotePrintView.displayName = 'QuotePrintView';
