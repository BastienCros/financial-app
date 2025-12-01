import BalanceSummary from "@/src/components/BalanceSummary";
import DashboardGrid from "@/src/components/DashboardGrid";

export default function Home() {
  return (
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-start gap-10 py-8 px-10">
        <h1 className="">Overview</h1>
        <BalanceSummary />
        <DashboardGrid className='grow'/>
      </main>
  );
}
