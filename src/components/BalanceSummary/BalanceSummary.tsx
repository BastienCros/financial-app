'use client'
import VisuallyHidden from "@/components/VisuallyHidden";
import { cx } from "@/utils";
import { formatCurrency} from '@/src/helpers';
import { useMonthStats } from "@/hooks/transactions.hooks";

import styles from "./balanceSummary.module.css";

interface BalanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string,
  amount: number,
  variant?: "light" | "dark",
  loading: boolean,
}
function BalanceCard({ title, amount, variant = "light", loading }: BalanceCardProps) {

  return (
    <li className="grow">
      <div className={cx(styles.balanceCard, "tw-card")} data-variant={variant}>
        <h3>{title}</h3>
        <p className="font-mono text-3xl font-bold">
          {
            loading ?
              "Loading..." :
              formatCurrency(amount)
          }
        </p>
      </div>
    </li>
  )
}

interface BalanceSummaryProps {
  month: Date | null;
}

function BalanceSummary({ month }: BalanceSummaryProps) {

  const { balance, income, expenses, loading, error } = useMonthStats(month);

  return (
    <div className="w-full">
      <h2><VisuallyHidden>Overview</VisuallyHidden></h2>
      <ul className={styles.balanceList}>
        <BalanceCard title="Current Balance" amount={balance} variant="dark" loading={loading} />
        <BalanceCard title="Income" amount={income} loading={loading} />
        <BalanceCard title="Expenses" amount={expenses} loading={loading} />
      </ul>
      {error && <div className="text-error mt-1">{error}</div>}
    </div>
  );
}

export default BalanceSummary;
