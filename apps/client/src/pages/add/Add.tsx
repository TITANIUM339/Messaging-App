import { Form } from "react-router";
import Button from "../../components/Button";

export default function Add() {
    return (
        <div className="border-b border-zinc-600 p-6">
            <section>
                <h1 className="text-xl font-bold">Add Friend</h1>
                <p className="mt-1 text-zinc-300">
                    You can add friends with their username.
                </p>
                <Form className="mt-4">
                    <div className="flex gap-2 rounded-lg border border-zinc-950 bg-zinc-900 p-2 transition-colors has-user-invalid:border-red-300 has-focus:border-sky-600">
                        <input
                            className="flex-1 text-zinc-200 outline-0"
                            type="text"
                            required
                            maxLength={32}
                            autoFocus
                            autoComplete="off"
                        />
                        <Button type="submit">Send Friend Request</Button>
                    </div>
                </Form>
            </section>
        </div>
    );
}
