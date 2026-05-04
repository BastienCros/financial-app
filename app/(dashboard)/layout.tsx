import { QueryClientProvider } from "@/src/contexts";

export default function Layout({
    children
}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <QueryClientProvider>
            {children}
        </QueryClientProvider>
    )
}