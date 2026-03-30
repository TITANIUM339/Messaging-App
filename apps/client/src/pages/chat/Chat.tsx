import Button from "@components/Button";
import { ConnectedFriendsContext } from "@components/ConnectedFriendsContext";
import Spinner from "@components/Spinner";
import api from "@lib/api";
import { decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import { use, useEffect, useRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { useFetcher, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import type { Message } from "../../types/type";

interface Member {
    id: number;
    username: string;
}

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
    const [scrollToBottom, setScrollToBottom] = useState(false);
    const [membersTyping, setMembersTyping] = useState<Member[]>([]);

    const connectedFriends = use(ConnectedFriendsContext);

    const fetcher = useFetcher();

    const anchorRef = useRef<null | HTMLDivElement>(null);
    const messagesContainerRef = useRef<null | HTMLDivElement>(null);
    const formRef = useRef<null | HTMLFormElement>(null);
    const timeoutRef = useRef<null | number>(null);

    useEffect(() => anchorRef.current?.scrollIntoView(), [fetcher.state]);

    useEffect(() => {
        if (scrollToBottom) {
            anchorRef.current?.scrollIntoView();

            setScrollToBottom(false);
        }
    }, [scrollToBottom]);

    useEffect(() => {
        setMessages(data.messages);
        setScrollToBottom(true);
    }, [data.messages]);

    useEffect(() => {
        if (fetcher.state === "submitting") {
            formRef.current?.reset();
        }
    }, [fetcher.state]);

    const chatId = data.chat?.privateChat?.id ?? data?.chat?.groupChat?.id;

    useEffect(() => {
        async function updateMessages(message: Message) {
            const privateKey = await decryptKey({
                privateKey: await readPrivateKey({
                    armoredKey: localStorage.getItem(`key-${api.user?.id}`)!,
                }),
                passphrase: api.user?.passphrase,
            });

            const content = (
                await decrypt({
                    message: await readMessage({
                        armoredMessage: message.content,
                    }),
                    decryptionKeys: privateKey,
                })
            ).data as string;

            setMessages((prev) => [...prev, { ...message, content }]);

            const element = messagesContainerRef.current;

            if (!element) {
                return;
            }

            // https://stackoverflow.com/a/42860948
            const isScrolledToBottom =
                element.scrollHeight -
                    element.scrollTop -
                    element.clientHeight <
                1;

            setScrollToBottom(isScrolledToBottom);
        }

        api.socket.on(`chat-${chatId}:new_message`, updateMessages);

        return () => {
            api.socket.off(`chat-${chatId}:new_message`, updateMessages);
        };
    }, [chatId]);

    useEffect(() => {
        function updateMembersTyping(event: Member & { typing: boolean }) {
            if (event.typing) {
                setMembersTyping((prev) => [
                    ...prev,
                    { id: event.id, username: event.username },
                ]);

                return;
            }

            setMembersTyping((prev) => [
                ...prev.filter((member) => member.id !== event.id),
            ]);
        }

        api.socket.on(`chat-${chatId}:member_typing`, updateMembersTyping);

        return () => {
            api.socket.off(`chat-${chatId}:member_typing`, updateMembersTyping);
        };
    }, [chatId]);

    const chatName =
        data.chat?.privateChat?.username ?? data?.chat?.groupChat?.title;

    return (
        <div className="grid h-dvh grid-rows-[min-content_1fr]">
            <div className="flex items-center border-b border-zinc-700 pt-2 pr-6 pb-2 pl-6">
                <div className="grid grid-cols-[min-content_1fr] items-center gap-2">
                    <div className="relative">
                        <div className="size-8 overflow-hidden rounded-full">
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
                        <p className="truncate text-sm text-zinc-400">
                            {membersTyping.length
                                ? membersTyping
                                      .map((member) =>
                                          data.chat.privateChat
                                              ? "Typing..."
                                              : `${member.username} Typing...`,
                                      )
                                      .join(", ")
                                : "—"}
                        </p>
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
                            <div className="size-12 overflow-hidden rounded-full">
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
                    <div ref={anchorRef}></div>
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
                            onChange={() => {
                                if (typeof timeoutRef.current !== "number") {
                                    timeoutRef.current = setTimeout(() => {
                                        api.socket.emit("typing", {
                                            chat: chatId,
                                            typing: false,
                                        });

                                        timeoutRef.current = null;
                                    }, 5000);

                                    api.socket.emit("typing", {
                                        chat: chatId,
                                        typing: true,
                                    });

                                    return;
                                }

                                clearTimeout(timeoutRef.current);

                                timeoutRef.current = setTimeout(() => {
                                    api.socket.emit("typing", {
                                        chat: chatId,
                                        typing: false,
                                    });

                                    timeoutRef.current = null;
                                }, 5000);
                            }}
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
