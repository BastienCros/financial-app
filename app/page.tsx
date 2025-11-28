import Overview from "@/components/Overview";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-start gap-10 py-8 px-16 bg-white dark:bg-black">
        <h1 className="">Overview</h1>
        <Overview />
      </main>
    </div>
  );
}
