import Button from "@components/Button";
import Dialog from "@components/Dialog";
import Spinner from "@components/Spinner";
import type { PrivateKeyFile, PrivateKeyText } from "@lib/schema";
import { useEffect, useId, useRef, useState } from "react";
import {
    BsCopy,
    BsDownload,
    BsExclamationCircle,
    BsExclamationCircleFill,
} from "react-icons/bs";
import { Link, useFetcher } from "react-router";
import type * as z from "zod";

type TreeifiedPrivateKeyTextError = ReturnType<
    typeof z.treeifyError<z.infer<typeof PrivateKeyText>>
>;
type TreeifiedPrivateKeyFileError = ReturnType<
    typeof z.treeifyError<z.infer<typeof PrivateKeyFile>>
>;

export default function Login() {
    const id1 = useId(),
        id2 = useId(),
        id3 = useId(),
        id4 = useId(),
        id5 = useId();

    const fetcher1 = useFetcher(),
        fetcher2 = useFetcher(),
        fetcher3 = useFetcher(),
        fetcher4 = useFetcher();

    const dialogRef1 = useRef<HTMLDialogElement | null>(null);
    const dialogRef2 = useRef<HTMLDialogElement | null>(null);

    const [downloadUrl, setDownloadUrl] = useState("");

    const error1 = fetcher1.data as "invalid_form" | "no_key" | undefined;
    const error2 = fetcher2.data as TreeifiedPrivateKeyTextError | undefined;
    const error3 = fetcher3.data as TreeifiedPrivateKeyFileError | undefined;

    const privateKey = fetcher4.data as string | undefined;

    if (error1 === "no_key") {
        dialogRef1.current?.showModal();
    }

    if (privateKey) {
        dialogRef2.current?.showModal();
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
            <h1 className="text-center text-2xl font-medium">Welcome back!</h1>
            <p className="mt-2 text-center text-zinc-300">
                We're so excited to see you again!
            </p>
            <fetcher1.Form className="mt-4 flex flex-col gap-6" method="POST">
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
                    {error1 === "invalid_form" ? (
                        <div className="flex items-center gap-1 text-sm text-red-300">
                            <BsExclamationCircleFill />
                            <p>Username or password is invalid</p>
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
                        autoComplete="current-password"
                        id={id2}
                        required
                    />
                    {error1 === "invalid_form" ? (
                        <div className="flex items-center gap-1 text-sm text-red-300">
                            <BsExclamationCircleFill />
                            <p>Username or password is invalid</p>
                        </div>
                    ) : null}
                </div>
                <Button
                    className="flex justify-center"
                    type="submit"
                    disabled={fetcher1.state !== "idle"}
                >
                    {fetcher1.state !== "idle" ? (
                        <Spinner size={24} />
                    ) : (
                        "Log In"
                    )}
                </Button>
            </fetcher1.Form>
            <p className="mt-2 text-zinc-400">
                Need an account?{" "}
                <Link className="text-indigo-300 hover:underline" to="/signup">
                    Sign Up
                </Link>
            </p>
            <Dialog
                ref={dialogRef1}
                closedby="none"
                className="w-full max-w-2xl"
            >
                <h1 className="text-xl font-bold">Provide your private key</h1>
                <p className="mt-1 text-zinc-400">
                    We need your private key to finish logging in.
                </p>
                <fetcher2.Form
                    className="mt-4 flex flex-col gap-6"
                    method="PUT"
                    action="/pgp"
                >
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={id3}
                            className="font-medium text-zinc-200"
                        >
                            Private key
                        </label>
                        <textarea
                            name="privateKeyText"
                            id={id3}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 outline-0 transition-colors user-invalid:border-red-300 focus:border-sky-600"
                            rows={10}
                            spellCheck={false}
                            required
                            autoFocus
                        ></textarea>
                        {error2?.properties?.privateKeyText ? (
                            <div className="flex items-center gap-1 text-sm text-red-300">
                                <BsExclamationCircleFill />
                                <p>
                                    {error2.properties.privateKeyText.errors[0]}
                                </p>
                            </div>
                        ) : null}
                        <input
                            type="hidden"
                            name="format"
                            value="text"
                            required
                            readOnly
                        />
                    </div>
                    <Button type="submit" disabled={fetcher2.state !== "idle"}>
                        {fetcher2.state !== "idle" ? (
                            <Spinner size={24} />
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </fetcher2.Form>
                <p className="mt-4 flex items-center gap-4 text-center text-zinc-400">
                    <span className="flex-1 border-b"></span>
                    <span>OR</span>
                    <span className="flex-1 border-b"></span>
                </p>
                <fetcher3.Form
                    className="mt-4 flex flex-col gap-6"
                    method="PUT"
                    action="/pgp"
                    encType="multipart/form-data"
                >
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={id4}
                            className="font-medium text-zinc-200"
                        >
                            Import private key
                        </label>
                        <input
                            type="file"
                            name="privateKeyFile"
                            id={id4}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 outline-0 transition-colors file:cursor-pointer file:rounded-lg file:border file:border-indigo-400 file:bg-indigo-500 file:p-2 file:font-medium file:transition-colors user-invalid:border-red-300 hover:file:border-indigo-500 hover:file:bg-indigo-600 focus:border-sky-600"
                            required
                        />
                        {error3?.properties?.privateKeyFile ? (
                            <div className="flex items-center gap-1 text-sm text-red-300">
                                <BsExclamationCircleFill />
                                <p>
                                    {error3.properties.privateKeyFile.errors[0]}
                                </p>
                            </div>
                        ) : null}
                        <input
                            type="hidden"
                            name="format"
                            value="file"
                            required
                            readOnly
                        />
                    </div>
                    <Button type="submit" disabled={fetcher3.state !== "idle"}>
                        {fetcher3.state !== "idle" ? (
                            <Spinner size={24} />
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </fetcher3.Form>
                <section className="mt-4 grid grid-cols-[min-content_1fr] items-center gap-x-2 gap-y-1 rounded-lg bg-red-600/20 p-2">
                    <BsExclamationCircle size={20} />
                    <h2 className="text-lg font-bold">Danger</h2>
                    <p className="col-start-2 text-zinc-300">
                        If you generate a new key pair, you <em>will</em> lose
                        access to all your previous messages. This action cannot
                        be undone.
                    </p>
                </section>
                <fetcher4.Form
                    className="mt-4 flex flex-col gap-6"
                    method="PATCH"
                    action="/pgp"
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="confirm"
                            id={id5}
                            className="flex size-6 cursor-pointer appearance-none items-center justify-center rounded border border-zinc-200 text-transparent transition-colors before:content-['✓'] checked:border-indigo-500 checked:bg-indigo-500 checked:text-zinc-200"
                            required
                        />
                        <label
                            htmlFor={id5}
                            className="font-medium text-zinc-200"
                        >
                            I understand
                        </label>
                    </div>
                    <Button
                        type="submit"
                        variant="danger"
                        className="flex w-full justify-center"
                        disabled={fetcher4.state !== "idle"}
                    >
                        {fetcher4.state !== "idle" ? (
                            <Spinner size={24} />
                        ) : (
                            "Generate new key pair"
                        )}
                    </Button>
                </fetcher4.Form>
                <Dialog ref={dialogRef2} closedby="none">
                    <h1 className="text-xl font-bold">
                        Store your private key somewhere safe
                    </h1>
                    <p className="mt-1 text-zinc-400">
                        This key is used for end-to-end encryption. Make sure
                        you save it because you <em>will</em> need it to log in
                        later. Do <em>not</em> share this key with anyone!
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
            </Dialog>
        </section>
    );
}
