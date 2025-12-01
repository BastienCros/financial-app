import BalanceSummary from "@/src/components/BalanceSummary";
import DashboardGrid from "@/src/components/DashboardGrid";

export default function Home() {
  return (
      <main className="flex flex-col items-start w-full min-h-screen gap-10 px-10 py-8 max-w-7xl">
        <h1 className="">Overview</h1>
        <BalanceSummary />
        <DashboardGrid className='grow'/>
      </main>
  );
}
