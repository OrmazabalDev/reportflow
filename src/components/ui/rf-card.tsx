import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RFCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
  padded?: boolean;
};

export function RFCard({
  className,
  children,
  interactive = false,
  padded = true,
  ...props
}: RFCardProps) {
  return (
    <div
      className={cn(
        "rounded-[18px] bg-white border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.02)] transition-all duration-150",
        padded ? "p-4 md:p-5" : "",
        interactive
          ? "cursor-pointer hover:border-slate-200 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_2px_4px_-1px_rgba(0,0,0,0.02)] active:scale-[0.99]"
          : "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
