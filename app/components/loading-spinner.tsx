import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  containerClassName
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      <div className={cn(
        "animate-spin rounded-full border-4 border-primary border-t-transparent",
        sizeClasses[size],
        className
      )} />
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="container mx-auto p-6 min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
