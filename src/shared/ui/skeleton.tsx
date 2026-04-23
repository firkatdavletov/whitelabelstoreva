import { cn } from "@/shared/lib/styles";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("bg-secondary/80 animate-pulse rounded-lg", className)}
      {...props}
    />
  );
}
