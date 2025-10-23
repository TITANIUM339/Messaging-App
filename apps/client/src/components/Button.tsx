import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function Button({
    className,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={twMerge(
                "rounded-lg border border-indigo-400 bg-indigo-500 p-2 font-medium text-white transition-colors not-disabled:cursor-pointer hover:not-disabled:border-indigo-500 hover:not-disabled:bg-indigo-600",
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
