import Button from "@components/Button";
import Dialog from "@components/Dialog";
import Spinner from "@components/Spinner";
import { Login } from "@lib/schema";
import { useEffect, useId, useRef, useState } from "react";
import { BsCopy, BsDownload, BsExclamationCircleFill } from "react-icons/bs";
import { Link, useFetcher } from "react-router";
import * as z from "zod";

type TreeifiedError = ReturnType<typeof z.treeifyError<z.infer<typeof Login>>>;

export default function Signup() {
    const id1 = useId(),
        id2 = useId();

    const fetcher = useFetcher();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [downloadUrl, setDownloadUrl] = useState("");

    const data = fetcher.data as
        | { success: true; privateKey: string }
        | { success: false; error: TreeifiedError }
        | undefined;

    const privateKey = data?.success ? data.privateKey : null;
    const error = !data?.success ? data?.error : null;

    if (privateKey) {
        dialogRef.current?.showModal();
    }

    useEffect(() => {
        if (!privateKey) {
            return;
        }

        const objectUrl = URL.createObjectURL(
            new Blob([privateKey], {
                type: "text/plain",
            }),
        );

        setDownloadUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [privateKey]);

    return (
        <section className="w-full max-w-2xl rounded-lg bg-zinc-800 p-8 shadow-lg">
            <h1 className="text-center text-2xl font-medium">
                Create an account
            </h1>
            <fetcher.Form className="mt-4 flex flex-col gap-6" method="post">
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-zinc-200" htmlFor={id1}>
                        Username <span className="text-red-300">*</span>
                    </label>
                    <input
                        className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 outline-0 transition-colors user-invalid:border-red-300 focus:border-sky-600"
                        type="text"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        id={id1}
                        maxLength={32}
                        spellCheck={false}
                        required
                    />
                    {error?.properties?.username ? (
                        <div className="flex items-center gap-1 text-sm text-red-300">
                            <BsExclamationCircleFill />
                            <p>{error.properties.username.errors[0]}</p>
                        </div>
                    ) : null}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-zinc-200" htmlFor={id2}>
                        Password <span className="text-red-300">*</span>
                    </label>
                    <input
                        className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 outline-0 transition-colors user-invalid:border-red-300 focus:border-sky-600"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        id={id2}
                        required
                    />
                    {error?.properties?.password ? (
                        <div className="flex items-center gap-1 text-sm text-red-300">
                            <BsExclamationCircleFill />
                            <p>{error.properties.password.errors[0]}</p>
                        </div>
                    ) : null}
                </div>
                <Button
                    className="flex justify-center"
                    type="submit"
                    disabled={fetcher.state !== "idle"}
                >
                    {fetcher.state !== "idle" ? (
                        <Spinner size={24} />
                    ) : (
                        "Sign Up"
                    )}
                </Button>
            </fetcher.Form>
            <p className="mt-2 text-zinc-400">
                Already have an account?{" "}
                <Link className="text-indigo-300 hover:underline" to="/login">
                    Log In
                </Link>
            </p>
            <Dialog ref={dialogRef} closedby="none">
                <h1 className="text-xl font-bold">
                    Store your private key somewhere safe
                </h1>
                <p className="mt-1 text-zinc-400">
                    This key is used for end-to-end encryption. Make sure you
                    save it because you <em>will</em> need it to log in later.
                    Do <em>not</em> share this key with anyone!
                </p>
                <pre className="mt-4 rounded-lg bg-zinc-900 p-2 wrap-break-word whitespace-pre-wrap text-zinc-300">
                    {privateKey}
                </pre>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        className="flex flex-1 items-center justify-center gap-2"
                        onClick={() => {
                            if (privateKey) {
                                navigator.clipboard
                                    .writeText(privateKey)
                                    .catch((error) => console.error(error));
                            }
                        }}
                        autoFocus
                    >
                        <BsCopy /> Copy
                    </Button>
                    <Button
                        className="flex flex-1 items-center justify-center gap-2"
                        link
                        to={downloadUrl}
                        download="private_key"
                        reloadDocument
                    >
                        <BsDownload /> Download
                    </Button>
                    <Button
                        className="flex-1 text-center"
                        variant="warning"
                        link
                        to="/"
                    >
                        Continue
                    </Button>
                </div>
            </Dialog>
        </section>
    );
}
