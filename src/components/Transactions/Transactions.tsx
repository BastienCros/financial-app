'use client'
import Image from 'next/image'
import Card, { CardAction } from "@/components/Card";
import { Transaction } from "@/types";
import { useTransactions } from "@/contexts";
import { cx } from "@/utils";
import { formatCurrency, getRecentTransactions, getCategoryIconUrl, getCategoryLabel } from '@/helpers';
import { formatTransactionDate } from "./Transactions.helpers";


import styles from "./Transactions.module.css";
import DefaultCategoryImage from '@/public/images/categories/other.svg';

interface TransactionItemProps {
  transaction: Transaction,
  className?: string,
}


function TransactionItem({ transaction, className }: TransactionItemProps) {
  const isAmountPositive = transaction.amount > 0;
  const iconUrl = getCategoryIconUrl(transaction.categoryId) || DefaultCategoryImage;
  const label = getCategoryLabel(transaction.categoryId);
  const categoryLabel = label ? `${label} category` : "Other category";

  return (
    <li key={transaction.id} className={cx(styles.transaction, className)}>
      <div className={styles.transactionSource}>
        <Image src={iconUrl} alt={categoryLabel} width={40} height={40} />
        <h3 className="text-sm font-bold">{transaction.description}</h3>
      </div>
      <div className={styles.transactionAmount}>
        <p
          className={cx("text-mono font-bold", isAmountPositive && "text-success")}
        >
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-fg-subtle">{formatTransactionDate(transaction.date)}</p>
      </div>
    </li>
  )
}

interface TransactionsProps {
  className?: string;
  count?: number;
  action?: CardAction;
}

function Transactions({ className, count, action }: TransactionsProps) {

  const { transactions } = useTransactions();
  const lastTransactions = getRecentTransactions(transactions, count || Infinity);

  return (
    <Card title="Transactions" headingLevel='h2' className={className} action={action}>
      <ul className="flex flex-col divide-y divide-background">
        {lastTransactions.map((t) => {
          return <TransactionItem key={t.id} transaction={t} className="py-4"></TransactionItem>;
        })}
      </ul>
    </Card>
  );
}

export default Transactions;
