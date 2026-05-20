import { cn } from "../../utils/cn";

const Sidebar = ({ className, ...props }) => (
  <aside className={cn("flex h-full flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground", className)} {...props} />
);

const SidebarSection = ({ className, ...props }) => <div className={cn("px-3 py-3", className)} {...props} />;

const SidebarLink = ({ className, active, ...props }) => (
  <div
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-white/10 hover:text-white",
      active && "bg-white/12 text-white",
      className
    )}
    {...props}
  />
);

export { Sidebar, SidebarLink, SidebarSection };
