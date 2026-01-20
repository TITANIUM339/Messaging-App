import { twMerge } from "tailwind-merge";

export default function Dialog({
    className,
    children,
    ...rest
}: React.DetailedHTMLProps<
    React.DialogHTMLAttributes<HTMLDialogElement>,
    HTMLDialogElement
>) {
    return (
        <dialog
            className={twMerge(
                "top-[50%] left-[50%] m-2 translate-x-[-50%] translate-y-[-50%] rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-zinc-100 shadow-lg backdrop:bg-black/50",
                className,
            )}
            {...rest}
        >
            {children}
        </dialog>
    );
}
