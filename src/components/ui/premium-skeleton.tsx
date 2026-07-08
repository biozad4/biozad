import { cn } from "@/lib/utils";

interface PremiumSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PremiumSkeleton({ className, ...props }: PremiumSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent dark:before:via-white/5",
        className
      )}
      {...props}
    />
  );
}