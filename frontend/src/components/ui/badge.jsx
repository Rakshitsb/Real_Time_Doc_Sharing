import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      accent: "bg-accent/15 text-accent",
      outline: "border border-border text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Badge = ({ className, variant, ...props }) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge };
