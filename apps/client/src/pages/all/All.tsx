import Button from "@components/Button";
import type { Friends } from "@lib/schema";
import { BsChatFill, BsXLg } from "react-icons/bs";
import { useFetcher, useLoaderData } from "react-router";
import * as z from "zod";

export default function All() {
    const data = useLoaderData<z.infer<typeof Friends>>();

    const fetcher = useFetcher();

    return (
        <div className="pt-2 pr-4 pb-2 pl-4">
            <h1 className="p-2 text-zinc-300">All — {data.length}</h1>
            <ul>
                {data.map((friend) => (
                    <li
                        key={friend.id}
                        className="flex w-full items-center gap-2 border-t border-zinc-700 p-2"
                    >
                        <div className="h-8 w-8 overflow-hidden rounded-full">
                            <img
                                className="object-cover"
                                src="https://picsum.photos/200/300"
                                alt=""
                            />
                        </div>
                        <section className="flex-1 truncate">
                            <h2 className="font-medium text-zinc-400">
                                {friend.username}
                            </h2>
                        </section>
                        <div className="flex gap-2">
                            <Button
                                link
                                to=""
                                variant="secondary"
                                className="rounded-full"
                                title="Message"
                            >
                                <BsChatFill />
                            </Button>
                            <fetcher.Form method="delete">
                                <input type="hidden" name="userId" value={friend.id} />
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="rounded-full not-disabled:hover:text-red-500"
                                    title="Remove"
                                >
                                    <BsXLg />
                                </Button>
                            </fetcher.Form>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
