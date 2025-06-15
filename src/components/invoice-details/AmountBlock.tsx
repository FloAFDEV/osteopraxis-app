
export const AmountBlock = ({
  amount,
  tvaMotif,
}: {
  amount: number;
  tvaMotif?: string | null;
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };
  return (
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
        Montant
      </div>
      <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
        {formatCurrency(amount)}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {tvaMotif ||
          "TVA non applicable - Article 261-4-1° du CGI"}
      </div>
    </div>
  );
};
