import { cn } from "@/shared/lib/styles";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-lg bg-secondary/80", className)} {...props} />;
}
