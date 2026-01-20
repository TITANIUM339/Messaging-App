import Button from "@components/Button";
import { ConnectedFriendsContext } from "@components/ConnectedFriendsContext";
import { UserId, type Friends } from "@lib/schema";
import { use, useEffect, useRef, useState } from "react";
import { BsChatFill, BsXLg } from "react-icons/bs";
import {
    useFetcher,
    useLoaderData,
    type FetcherWithComponents,
} from "react-router";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

// This part is extracted into its own component due to the difficulties of using refs in an array
function Friend({
    friend,
    isOnline,
    fetcher,
}: {
    friend: z.infer<typeof Friends>[number];
    isOnline?: boolean;
    fetcher: FetcherWithComponents<unknown>;
}) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    return (
        <li className="flex w-full items-center gap-2 border-t border-zinc-700 p-2">
            <div className="relative">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <img
                        className="object-cover"
                        src="https://picsum.photos/200/300"
                        alt=""
                    />
                </div>
                <div
                    className={twMerge(
                        "absolute right-0 bottom-0 size-4 translate-[3px] rounded-full border-3 border-zinc-800 bg-zinc-500",
                        isOnline && "bg-green-500",
                    )}
                ></div>
            </div>
            <section className="flex-1 truncate">
                <h2 className="text-lg font-medium">{friend.username}</h2>
                <p className="text-sm text-zinc-400">
                    {isOnline ? "Online" : "Offline"}
                </p>
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
                <Button
                    variant="secondary"
                    className="rounded-full not-disabled:hover:text-red-500"
                    title="Remove"
                    onClick={() => dialogRef.current?.showModal()}
                >
                    <BsXLg />
                </Button>
            </div>
            <dialog
                ref={dialogRef}
                className="top-[50%] left-[50%] m-2 translate-x-[-50%] translate-y-[-50%] rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-zinc-100 shadow-lg backdrop:bg-black/50"
            >
                <section>
                    <h1 className="text-xl font-bold">
                        Remove '{friend.username}'
                    </h1>
                    <p className="mt-1 text-zinc-400">
                        Are you sure you want to remove {friend.username} from
                        your friends?
                    </p>
                </section>
                <div className="mt-4 flex gap-2">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={() => dialogRef.current?.close()}
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <fetcher.Form className="flex-1" method="DELETE">
                        <input
                            type="hidden"
                            name="userId"
                            value={friend.id}
                            readOnly
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            variant="danger"
                        >
                            Remove
                        </Button>
                    </fetcher.Form>
                </div>
            </dialog>
        </li>
    );
}

export default function All() {
    const fetcher = useFetcher();

    const data = useLoaderData<z.infer<typeof Friends>>();

    const [friends, setFriends] = useState(data);

    const connectedFriends = use(ConnectedFriendsContext);

    // Optimistic UI
    useEffect(() => {
        const result = UserId.safeParse({
            userId: fetcher.formData?.get("userId"),
        });

        if (!result.success) {
            return;
        }

        switch (fetcher.formMethod) {
            case "DELETE":
                setFriends((prev) =>
                    prev.filter((friend) => friend.id !== result.data.userId),
                );

                break;

            default:
                break;
        }
    }, [fetcher]);

    return (
        <div className="pt-2 pr-4 pb-2 pl-4">
            <h1 className="p-2 text-zinc-300">All — {friends.length}</h1>
            <ul>
                {friends.map((friend) => (
                    <Friend
                        key={friend.id}
                        friend={friend}
                        isOnline={connectedFriends.some(
                            (connectedFriend) =>
                                connectedFriend.id === friend.id,
                        )}
                        fetcher={fetcher}
                    />
                ))}
            </ul>
        </div>
    );
}
