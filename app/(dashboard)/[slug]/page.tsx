import Link from "next/link";
import { buttonStyles } from "@/src/components/Button";

// Catch-All resources for better Not Found page

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
    const { slug } = await params;

    return (
        <div className="w-full flex flex-col items-center justify-center gap-8">
            <h2 className="font-bold tex-xl">Page Not Found</h2>
            <p>Following ressource is not supported : <strong>{slug ?? "Unknown ressources"}</strong></p>
            <Link className={buttonStyles} href="/">Return to Dashboard</Link>
        </div>
    );
}
