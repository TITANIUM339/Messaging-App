import type { ButtonHTMLAttributes } from "react";
import { Link, NavLink, type LinkProps, type NavLinkProps } from "react-router";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    link?: false;
    navLink?: false;
    variant?: "primary" | "secondary" | "danger" | "warning";
}

interface LinkButtonProps extends LinkProps {
    link: true;
    navLink?: false;
    variant?: "primary" | "secondary" | "danger" | "warning";
}

interface NavLinkButtonProps extends NavLinkProps {
    link?: false;
    navLink: true;
    variant?: "primary" | "secondary" | "danger" | "warning";
}

export default function Button(
    props: ButtonProps | LinkButtonProps | NavLinkButtonProps,
) {
    const baseStyles =
        "block rounded-lg p-2 font-medium transition-colors not-disabled:cursor-pointer";

    const styles = {
        primary:
            "border border-indigo-400 bg-indigo-500 text-white hover:not-disabled:border-indigo-500 hover:not-disabled:bg-indigo-600",
        secondary:
            "hover:not-disabled:bg-zinc-700 hover:not-disabled:text-zinc-100 text-zinc-300",
        danger: "bg-red-700 hover:not-disabled:bg-red-800",
        warning:
            "border border-amber-300 bg-amber-400/20 hover:not-disabled:bg-amber-400/40",
    }[props.variant ?? "primary"];

    if (props.link) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { className, children, link: _, ...rest } = props;

        return (
            <Link className={twMerge(baseStyles, styles, className)} {...rest}>
                {children}
            </Link>
        );
    }

    if (props.navLink) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { className, children, navLink: _, ...rest } = props;

        return (
            <NavLink
                className={(props) =>
                    twMerge(
                        baseStyles,
                        styles,
                        typeof className === "string"
                            ? className
                            : className?.(props),
                    )
                }
                {...rest}
            >
                {children}
            </NavLink>
        );
    }

    const { className, children, ...rest } = props;

    return (
        <button
            type="button"
            className={twMerge(baseStyles, styles, className)}
            {...rest}
        >
            {children}
        </button>
    );
}
