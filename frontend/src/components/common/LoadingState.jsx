import { Skeleton } from "../ui/skeleton";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border border-border bg-card p-5">
            <Skeleton className="mb-4 h-5 w-2/3" />
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
