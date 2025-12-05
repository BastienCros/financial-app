import BalanceSummary from "@/src/components/BalanceSummary";
import DashboardGrid from "@/src/components/DashboardGrid";

export const metadata = {
    title: 'Overview | Financial App',
    description: 'View your financial overview including account balances, budgets, transactions, and recurring bills',
    keywords: ['finance', 'budget', 'transactions', 'dashboard'],
    openGraph: {
        title: 'Financial Dashboard',
        description: 'Manage your finances',
    }
};

export default function Home() {
    return (

        <main className="flex flex-col items-start w-full min-h-screen gap-10 px-4 py-8 sm:px-10 max-w-7xl mx-auto">
            <h1 className="">Overview</h1>
            <BalanceSummary />
            <DashboardGrid className='grow' />
        </main>
    );
}
