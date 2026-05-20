import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utils/cn";

const Tabs = TabsPrimitive.Root;

const TabsList = ({ className, ...props }) => (
  <TabsPrimitive.List className={cn("inline-flex h-10 items-center rounded-md bg-secondary p-1", className)} {...props} />
);

const TabsTrigger = ({ className, ...props }) => (
  <TabsPrimitive.Trigger
    className={cn("inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)}
    {...props}
  />
);

const TabsContent = ({ className, ...props }) => (
  <TabsPrimitive.Content className={cn("mt-4 focus-visible:outline-none", className)} {...props} />
);

export { Tabs, TabsContent, TabsList, TabsTrigger };
