import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../utils/cn";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({ className, ...props }) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn("z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md", className)}
      sideOffset={6}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
