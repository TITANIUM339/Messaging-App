import Button from "@components/Button";
import { ConnectedFriendsContext } from "@components/ConnectedFriendsContext";
import Spinner from "@components/Spinner";
import api from "@lib/api";
import { decrypt, readMessage } from "openpgp";
import { use, useEffect, useRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { useFetcher, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import type { Message } from "../../types/type";

export default function Chat() {
    const data = useLoaderData<{
        chat: {
            privateChat?: { id: number; userId: number; username: string };
            groupChat?: {
                id: number;
                title: string;
                icon?: string;
                owner: number;
            };
        };
        messages: Message[];
    }>();

    const [messages, setMessages] = useState(data.messages);

    const connectedFriends = use(ConnectedFriendsContext);

    const fetcher = useFetcher();

    const messagesContainerRef = useRef<null | HTMLDivElement>(null);
    const formRef = useRef<null | HTMLFormElement>(null);

    useEffect(
        () =>
            // https://stackoverflow.com/a/11715670
            messagesContainerRef.current?.scrollTo(
                0,
                messagesContainerRef.current.scrollHeight,
            ),
        [fetcher.state],
    );

    useEffect(() => {
        if (fetcher.state === "submitting") {
            formRef.current?.reset();
        }
    }, [fetcher.state]);

    useEffect(() => {
        async function updateMessages(message: Message) {
            const content = (
                await decrypt({
                    message: await readMessage({
                        armoredMessage: message.content,
                    }),
                    decryptionKeys: api.privateKey!,
                })
            ).data as string;

            setMessages((prev) => [...prev, { ...message, content }]);
        }

        const chatId = data.chat?.privateChat?.id ?? data?.chat?.groupChat?.id;

        api.socket.on(`chat-${chatId}:new_message`, updateMessages);

        return () => {
            api.socket.off(`chat-${chatId}:new_message`, updateMessages);
        };
    }, [data.chat]);

    const chatName =
        data.chat?.privateChat?.username ?? data?.chat?.groupChat?.title;

    return (
        <div className="grid h-dvh grid-rows-[min-content_1fr]">
            <div className="flex items-center border-b border-zinc-700 pt-2 pr-6 pb-2 pl-6">
                <div className="grid grid-cols-[min-content_1fr] items-center gap-2">
                    <div className="relative">
                        <div className="h-6 w-6 overflow-hidden rounded-full">
                            <img
                                className="object-cover"
                                src={`https://api.dicebear.com/9.x/identicon/svg?seed=${chatName}`}
                                alt="Avatar"
                            />
                        </div>
                        {data.chat.privateChat ? (
                            <div
                                className={twMerge(
                                    "absolute right-0 bottom-0 size-3 translate-[3px] rounded-full border-2 border-zinc-800 bg-zinc-500",
                                    connectedFriends.some(
                                        (connectedFriend) =>
                                            connectedFriend.id ===
                                            data.chat?.privateChat?.userId,
                                    ) && "bg-green-500",
                                )}
                            ></div>
                        ) : null}
                    </div>
                    <section className="truncate">
                        <h1 className="truncate text-lg font-medium">
                            {chatName}
                        </h1>
                    </section>
                </div>
            </div>
            <div
                className="relative grid h-full grid-rows-[1fr_min-content] overflow-y-auto"
                ref={messagesContainerRef}
            >
                <ul>
                    {messages.map((message) => (
                        <li
                            key={message.id}
                            className="grid grid-cols-[min-content_1fr] gap-2 pt-2 pr-6 pb-2 pl-6"
                        >
                            <div className="h-10 w-10 overflow-hidden rounded-full">
                                <img
                                    className="object-cover"
                                    src={`https://api.dicebear.com/9.x/identicon/svg?seed=${message.senderUsername}`}
                                    alt="Avatar"
                                />
                            </div>
                            <div>
                                <section className="grid grid-cols-[minmax(1ch,min-content)_min-content] items-center gap-2">
                                    <h2 className="truncate text-lg font-medium">
                                        {message.senderUsername}
                                    </h2>
                                    <time
                                        className="whitespace-nowrap text-zinc-400"
                                        dateTime={message.createdAt}
                                    >
                                        {new Date(
                                            message.createdAt,
                                        ).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                        })}
                                    </time>
                                </section>
                                <p className="wrap-anywhere text-zinc-300">
                                    {message.content}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="sticky bottom-0 w-full">
                    <fetcher.Form
                        ref={formRef}
                        className="m-2 grid grid-cols-[1fr_min-content] gap-4 rounded bg-zinc-700 p-2"
                        method="POST"
                    >
                        <textarea
                            className="field-sizing-content max-h-64 resize-none p-2"
                            name="message"
                            placeholder={`Message ${chatName}`}
                            required
                        ></textarea>
                        <Button
                            className="self-start p-3"
                            title="Send"
                            type="submit"
                            disabled={fetcher.state !== "idle"}
                        >
                            {fetcher.state !== "idle" ? (
                                <Spinner />
                            ) : (
                                <BsFillSendFill />
                            )}
                        </Button>
                    </fetcher.Form>
                </div>
            </div>
        </div>
    );
}
