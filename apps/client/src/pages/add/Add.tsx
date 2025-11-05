import { BsCheckCircleFill, BsExclamationCircleFill } from "react-icons/bs";
import { useFetcher } from "react-router";
import * as z from "zod";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";
import { Username } from "../../lib/schema";

type TreeifiedError = ReturnType<
    typeof z.treeifyError<z.infer<typeof Username>>
>;

export default function Add() {
    const fetcher = useFetcher();

    const data = fetcher.data as
        | { success: true }
        | { success: false; error: TreeifiedError }
        | undefined;

    return (
        <div className="border-b border-zinc-700 p-6">
            <section>
                <h1 className="text-xl font-bold">Add Friend</h1>
                <p className="mt-1 text-zinc-300">
                    You can add friends with their username.
                </p>
                <fetcher.Form className="mt-4" method="post">
                    <div className="flex gap-2 rounded-lg border border-zinc-950 bg-zinc-900 p-2 transition-colors has-user-invalid:border-red-300 has-focus:border-sky-600">
                        <input
                            className="flex-1 text-zinc-200 outline-0"
                            type="text"
                            name="username"
                            required
                            maxLength={32}
                            autoFocus
                            autoComplete="off"
                        />
                        <Button
                            className="flex justify-center"
                            type="submit"
                            disabled={fetcher.state !== "idle"}
                        >
                            {fetcher.state !== "idle" ? (
                                <Spinner size={24} />
                            ) : (
                                "Send Friend Request"
                            )}
                        </Button>
                    </div>
                    {!data?.success && data?.error.properties?.username ? (
                        <div className="mt-2 flex items-center gap-1 text-sm text-red-300">
                            <BsExclamationCircleFill />
                            <p>{data.error.properties.username.errors[0]}</p>
                        </div>
                    ) : null}
                    {data?.success ? (
                        <div className="mt-2 flex items-center gap-1 text-sm text-green-300">
                            <BsCheckCircleFill />
                            <p>Friend request sent!</p>
                        </div>
                    ) : null}
                </fetcher.Form>
            </section>
        </div>
    );
}
