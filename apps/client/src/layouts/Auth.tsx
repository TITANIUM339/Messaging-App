import { BsGithub } from "react-icons/bs";
import { Link, Outlet } from "react-router";

export default function Auth() {
    return (
        <div className="grid min-h-dvh grid-rows-[min-content_1fr] bg-zinc-900 text-zinc-100">
            <header>
                <div className="p-6">
                    <Link to="/" className="text-2xl font-bold">
                        Messaging App
                    </Link>
                </div>
            </header>
            <main className="flex items-center justify-center p-2">
                <Outlet />
            </main>
            <footer className="flex items-center justify-center gap-2 p-2">
                Copyright © TITANIUM339 {new Date().getFullYear()}
                <Link
                    to="https://github.com/TITANIUM339"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-125"
                >
                    <BsGithub />
                </Link>
            </footer>
        </div>
    );
}
