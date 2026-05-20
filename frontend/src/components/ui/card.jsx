import { cn } from "../../utils/cn";

const Card = ({ className, ...props }) => (
  <div className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)} {...props} />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-normal", className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

const CardContent = ({ className, ...props }) => <div className={cn("p-6 pt-0", className)} {...props} />;

const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
