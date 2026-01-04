export function formatTransactionDate(transactionDate: string) {
  const d = new Date(transactionDate);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}