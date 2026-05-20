import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../../utils/cn";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuContent = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      className={cn("z-50 min-w-44 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-soft", className)}
      sideOffset={8}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

const DropdownMenuItem = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Item
    className={cn("flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary", className)}
    {...props}
  />
);

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };
