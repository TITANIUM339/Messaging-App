import { useId } from "react";
import { BsExclamationCircleFill } from "react-icons/bs";
import { Form, Link, useActionData, useNavigation } from "react-router";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";

export default function Login() {
    const id1 = useId(),
        id2 = useId();

    const data = useActionData<unknown>();

    const navigation = useNavigation();

    return (
        <section className="w-full max-w-2xl rounded-lg bg-zinc-800 p-8 shadow-lg">
            <h1 className="text-center text-2xl font-medium">Welcome back!</h1>
            <p className="mt-2 text-center text-zinc-300">
                We're so excited to see you again!
            </p>
            <Form className="mt-4 flex flex-col gap-6" method="post">
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
                    {data ? (
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
                    {data ? (
                        <div className="flex items-center gap-1 text-sm text-red-300">
                            <BsExclamationCircleFill />
                            <p>Username or password is invalid</p>
                        </div>
                    ) : null}
                </div>
                <Button
                    className="flex justify-center"
                    type="submit"
                    disabled={navigation.state !== "idle"}
                >
                    {navigation.state !== "idle" ? (
                        <Spinner size={24} />
                    ) : (
                        "Log In"
                    )}
                </Button>
            </Form>
            <p className="mt-2 text-zinc-400">
                Need an account?{" "}
                <Link className="text-indigo-300 hover:underline" to="/signup">
                    Sign Up
                </Link>
            </p>
        </section>
    );
}
