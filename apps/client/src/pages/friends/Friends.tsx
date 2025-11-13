import Button from "@components/Button";
import { BsDot, BsFillPeopleFill } from "react-icons/bs";
import { Outlet } from "react-router";

export default function Friends() {
    return (
        <div className="grid h-full grid-rows-[min-content_1fr]">
            <nav className="flex items-center gap-2 border-b border-zinc-700 pt-2 pr-6 pb-2 pl-6">
                <section className="flex items-center gap-2">
                    <BsFillPeopleFill className="text-zinc-400" />
                    <h1 className="font-medium">Friends</h1>
                    <BsDot className="text-zinc-600" size={20} />
                </section>
                <ul className="flex gap-4">
                    <li>
                        <Button
                            navLink
                            to=""
                            variant="secondary"
                            className={({ isActive }) => {
                                if (isActive) {
                                    return "bg-zinc-600";
                                }

                                return;
                            }}
                            end
                        >
                            All
                        </Button>
                    </li>
                    <li>
                        <Button
                            navLink
                            to="pending"
                            variant="secondary"
                            className={({ isActive }) => {
                                if (isActive) {
                                    return "bg-zinc-600";
                                }

                                return;
                            }}
                            end
                        >
                            Pending
                        </Button>
                    </li>
                    <li>
                        <Button
                            navLink
                            to="add"
                            className={({ isActive }) => {
                                if (isActive) {
                                    return "bg-indigo-500/30 text-indigo-200";
                                }

                                return;
                            }}
                            end
                        >
                            Add Friend
                        </Button>
                    </li>
                </ul>
            </nav>
            <div>
                <Outlet />
            </div>
        </div>
    );
}
