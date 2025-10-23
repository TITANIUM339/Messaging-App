import { Link, Outlet } from "react-router";

export default function Auth() {
    return (
        <div className="grid min-h-dvh grid-rows-[min-content_1fr] bg-zinc-900 p-2 text-zinc-100">
            <header>
                <div className="p-4">
                    <Link to="/" className="text-2xl font-bold">
                        Messaging App
                    </Link>
                </div>
            </header>
            <main className="flex items-center justify-center">
                <Outlet />
            </main>
        </div>
    );
}
