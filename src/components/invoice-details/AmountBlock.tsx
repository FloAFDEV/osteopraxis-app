import { BlurredAmount } from "@/components/ui/blurred-amount";

export const AmountBlock = ({
  amount,
  tvaMotif,
}: {
  amount: number;
  tvaMotif?: string | null;
}) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
        Montant
      </div>
      <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
        {formatAmount(amount)} €
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {tvaMotif ||
          "TVA non applicable - Article 261-4-1° du CGI"}
      </div>
    </div>
  );
};