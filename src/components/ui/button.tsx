import Link, { type LinkProps } from "next/link";
import { LoaderCircle } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BaseButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm" | "icon";
  loading?: boolean;
  icon?: ReactNode;
  href?: string;
  children: ReactNode;
};

type ButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<AnchorHTMLAttributes<HTMLAnchorElement>> &
  Partial<LinkProps>;

type Variant = NonNullable<BaseButtonProps["variant"]>;

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--rf-primary)] !text-white shadow-sm hover:bg-[var(--rf-primary-dark)] active:bg-[#1b2d43]",
  secondary:
    "bg-white text-slate-800 ring-1 ring-[var(--rf-border)] hover:bg-slate-50 active:bg-slate-100",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70",
  danger:
    "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 active:bg-red-200/60",
};

const sizes = {
  default: "min-h-[52px] px-5 py-3 text-[15px]",
  sm: "min-h-[44px] px-4 py-2.5 text-sm",
  icon: "min-h-[44px] min-w-[44px] p-2.5",
};

export function Button({
  className,
  children,
  variant = "primary",
  size = "default",
  loading = false,
  icon,
  href,
  disabled,
  target,
  rel,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rf-primary)]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    "rounded-[var(--rf-radius-btn)]",
    "[&_svg]:size-[18px] [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes} prefetch={false}>
        {icon ? <span className="shrink-0">{icon}</span> : null}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
