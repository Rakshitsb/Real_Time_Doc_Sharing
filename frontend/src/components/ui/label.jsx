import { cn } from "../../utils/cn";

const Label = ({ className, ...props }) => {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />;
};

export { Label };
