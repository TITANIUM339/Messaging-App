import Spinner from "@components/Spinner";

export default function HydrateFallback() {
    return (
        <main className="flex h-dvh items-center justify-center bg-zinc-800 text-zinc-100">
            <section aria-label="Loading">
                <Spinner size={64} />
            </section>
        </main>
    );
}
