import { TransactionsProvider } from "@/src/contexts";

export default function Layout({
    children
}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <TransactionsProvider>
            {children}
        </TransactionsProvider>
    )
}