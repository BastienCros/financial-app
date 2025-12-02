import * as React from "react";
import Image from 'next/image'
import Card from "@/components/Card";

import styles from "./Transactions.module.css";

import { Transaction } from "./Transactions.types";
import { transactions } from "./Transactions.constant";
import { formatTransactionDate } from "./Transactions.helpers";
import { cx } from "@/src/lib/utilities";

interface TransactionItemProps {
  transaction: Transaction,
  className?: string,
}

function TransactionItem({ transaction, className }: TransactionItemProps) {
  const isAmountPositive = transaction.amount > 0
  const amount =
    isAmountPositive ? "+$" + transaction.amount
      : "-$" + Math.abs(transaction.amount)

  return (
    <li key={transaction.id} className={cx(styles.transaction, className)}>
      <div className={styles.transactionSource}>
        <Image src={transaction.avatarUrl} alt="" width={40} height={40} />
        <h3 className="text-sm font-bold">{transaction.name}</h3>
      </div>
      <div className={styles.transactionAmount}>
        <p className={cx("text-mono font-bold", isAmountPositive && "text-success")}>{amount}</p>
        <p className="text-xs text-fg-subtle">{formatTransactionDate(transaction.date)}</p>
      </div>
    </li>
  )
}

interface TransactionsProps {
  className?: string;
}

function Transactions({ className }: TransactionsProps) {
  return (
    <Card title="Transactions" className={className}>
      <ul className="flex flex-col divide-y divide-background">
        {transactions.map((t) => {
          return <TransactionItem key={t.id} transaction={t} className="py-4"></TransactionItem>;
        })}
      </ul>
    </Card>
  );
}

export default Transactions;
