import Transactions from "@/components/Transactions";
import Link from "next/link";

export const metadata = {
  title: 'Transactions | Financial App',
  description: 'View and manage all your financial transactions'
}

export default function Page() {
  return (

    <main className="flex flex-col items-center w-full min-h-screen gap-10 px-4 py-8 sm:px-10 max-w-7xl mx-auto">
      <header className="w-full max-w-180 flex justify-between items-center">
        <h1 >Transactions</h1>
        <Link
          href="/"
          className="text-fg-subtle hover:text-fg text-sm"
          aria-label="Go back to dashboard"
        >
          Go Back <span aria-hidden="true">›</span>
        </Link>
      </header>
      <Transactions className="w-full max-w-180" />
    </main>
  );
}
