import { isRouteErrorResponse, useRouteError } from "react-router";

export default function ErrorBoundary() {
    const error = useRouteError();

    console.error(error);

    const isRouteError = isRouteErrorResponse(error);

    return (
        <main className="flex h-dvh items-center justify-center bg-zinc-800 text-zinc-100">
            <section>
                <h1 className="text-xl">
                    {isRouteError ? error.status : "Error"}
                </h1>
                <p className="text-zinc-300">
                    {isRouteError
                        ? error.statusText
                        : "Oops! Something went wrong."}
                </p>
            </section>
        </main>
    );
}
