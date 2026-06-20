import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-200/80",
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200 bg-white p-5 space-y-4",
        className,
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function SkeletonReportRow() {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 w-28 rounded-2xl" />
        <Skeleton className="h-11 w-20 rounded-2xl" />
      </div>
    </div>
  );
}
