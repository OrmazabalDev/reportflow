import Link, { type LinkProps } from "next/link";
import { LoaderCircle } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BaseButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "link";
  size?: "default" | "sm" | "icon";
  loading?: boolean;
  icon?: ReactNode;
  href?: string;
  children: ReactNode;
};

type RFButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<AnchorHTMLAttributes<HTMLAnchorElement>> &
  Partial<LinkProps>;

type Variant = NonNullable<BaseButtonProps["variant"]>;

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--rf-primary)] text-white shadow-sm hover:bg-[var(--rf-primary-light)] active:bg-[var(--rf-primary-dark)] active:scale-[0.97]",
  secondary:
    "bg-white text-slate-800 ring-1 ring-[var(--rf-border)] hover:bg-slate-50 active:bg-slate-100 active:scale-[0.97]",
  danger:
    "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 active:bg-red-200 active:scale-[0.97]",
  link:
    "bg-transparent text-[var(--rf-primary)] hover:underline active:text-[var(--rf-primary-dark)] p-0 min-h-0 min-w-0 font-bold",
};

const sizes = {
  default: "min-h-[46px] px-5 py-2.5 text-sm",
  sm: "min-h-[38px] px-3.5 py-2 text-xs",
  icon: "min-h-[44px] min-w-[44px] p-2.5",
};

export function RFButton({
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
}: RFButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rf-primary)]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    "rounded-xl",
    "[&_svg]:size-[16px] [&_svg]:shrink-0",
    variants[variant],
    variant !== "link" ? sizes[size] : "",
    className
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes} prefetch={false}>
        {icon && !loading ? <span className="shrink-0">{icon}</span> : null}
        {loading ? <LoaderCircle className="animate-spin size-[16px]" /> : null}
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
      {loading ? <LoaderCircle className="animate-spin size-[16px]" /> : icon}
      {children}
    </button>
  );
}
