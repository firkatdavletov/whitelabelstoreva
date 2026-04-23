import { Skeleton } from "@/shared/ui/skeleton";

export default function OrderLoadingPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-11 w-72 rounded-full" />
        <Skeleton className="h-5 w-96 max-w-full rounded-full" />
      </div>

      <div className="border-border/70 bg-card/90 rounded-2xl border p-6 shadow-[0_24px_80px_-40px_rgba(31,26,23,0.4)]">
        <div className="grid gap-3 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
