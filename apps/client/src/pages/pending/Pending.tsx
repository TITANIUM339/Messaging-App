import Button from "@components/Button";
import api from "@lib/api";
import { type FriendRequests, FriendRequestId } from "@lib/schema";
import { useEffect, useState } from "react";
import { BsCheckLg, BsXLg } from "react-icons/bs";
import { useFetcher, useLoaderData } from "react-router";
import * as z from "zod";

export default function Pending() {
    const fetcher = useFetcher();

    const data = useLoaderData<z.infer<typeof FriendRequests>>();

    const [friendRequests, setFriendRequests] = useState(data);

    // Optimistic UI
    useEffect(() => {
        const result = FriendRequestId.safeParse({
            senderId: fetcher.formData?.get("senderId"),
            receiverId: fetcher.formData?.get("receiverId"),
        });

        if (!result.success) {
            return;
        }

        switch (fetcher.formMethod) {
            case "DELETE":
                // Remove the friend request
                setFriendRequests((prev) =>
                    prev.filter(
                        (friendRequest) =>
                            !(
                                friendRequest.senderId ===
                                    result.data.senderId &&
                                friendRequest.receiverId ===
                                    result.data.receiverId
                            ),
                    ),
                );

                break;

            case "POST":
                // Remove the friend request and it's reciprocal if it exists
                setFriendRequests((prev) =>
                    prev.filter(
                        (friendRequest) =>
                            !(
                                (friendRequest.senderId ===
                                    result.data.senderId ||
                                    friendRequest.senderId ===
                                        result.data.receiverId) &&
                                (friendRequest.receiverId ===
                                    result.data.senderId ||
                                    friendRequest.receiverId ===
                                        result.data.receiverId)
                            ),
                    ),
                );

                break;
            default:
                break;
        }
    }, [fetcher]);

    return (
        <div className="pt-2 pr-4 pb-2 pl-4">
            <h1 className="p-2 text-zinc-300">
                Pending — {friendRequests.length}
            </h1>
            <ul>
                {friendRequests.map((friendRequest) => (
                    <li
                        key={`${friendRequest.senderId}${friendRequest.receiverId}`}
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
                                {api.user?.id === friendRequest.receiverId
                                    ? friendRequest.senderUsername
                                    : friendRequest.receiverUsername}
                            </h2>
                        </section>
                        <div className="flex gap-2">
                            {api.user?.id === friendRequest.receiverId ? (
                                <fetcher.Form method="post">
                                    <input
                                        type="hidden"
                                        name="senderId"
                                        value={friendRequest.senderId}
                                        readOnly
                                    />
                                    <input
                                        type="hidden"
                                        name="receiverId"
                                        value={friendRequest.receiverId}
                                        readOnly
                                    />
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        className="rounded-full not-disabled:hover:text-green-500"
                                        title="Accept"
                                    >
                                        <BsCheckLg />
                                    </Button>
                                </fetcher.Form>
                            ) : null}
                            <fetcher.Form method="delete">
                                <input
                                    type="hidden"
                                    name="senderId"
                                    value={friendRequest.senderId}
                                    readOnly
                                />
                                <input
                                    type="hidden"
                                    name="receiverId"
                                    value={friendRequest.receiverId}
                                    readOnly
                                />
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="rounded-full not-disabled:hover:text-red-500"
                                    title="Ignore"
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
