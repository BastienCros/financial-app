'use client'
import Image from 'next/image'
import Card from "@/components/Card";
import { Transaction } from "@/types";
import { useTransactions } from "@/src/contexts";

import DefaultCategoryImage from '@/public/images/icons/default-category.svg'

import styles from "./Transactions.module.css";

import { formatTransactionDate } from "./Transactions.helpers";
import { cx } from "@/utils";
import { formatCurrency, getRecentTransactions } from '@/src/helpers';

interface TransactionItemProps {
  transaction: Transaction,
  className?: string,
}


function TransactionItem({ transaction, className }: TransactionItemProps) {
  const isAmountPositive = transaction.amount > 0

  return (
    <li key={transaction.id} className={cx(styles.transaction, className)}>
      <div className={styles.transactionSource}>
        <Image src={DefaultCategoryImage} alt="" width={40} height={40} />
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
}

function Transactions({ className }: TransactionsProps) {

  const { transactions } = useTransactions();
  const lastTransactions = getRecentTransactions(transactions, 5);

  return (
    <Card title="Transactions" className={className}>
      <ul className="flex flex-col divide-y divide-background">
        {lastTransactions.map((t) => {
          return <TransactionItem key={t.id} transaction={t} className="py-4"></TransactionItem>;
        })}
      </ul>
    </Card>
  );
}

export default Transactions;
